<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import AdminLayout from '@/components/admin/AdminLayout.vue';
import StatsCards from '@/components/admin/StatsCards.vue';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { loadGoogleMaps } from '@/services/googleMapsLoader';
import { statusLabel, statusVariant } from '@/lib/constants';
import api from '@/services/api';
import { useRouter } from 'vue-router';

const router = useRouter();
const stats = ref<any>(null);
const loading = ref(true);
const error = ref('');
const mapDiv = ref<HTMLDivElement>();
let mapInstance: google.maps.Map | null = null;
const markers: google.maps.Marker[] = [];

onMounted(async () => {
    try {
        const { data } = await api.get('/admin/dashboard');
        stats.value = data;
        loading.value = false;

        await nextTick();

        // Initialize Google Maps showing recent locations
        const google = await loadGoogleMaps();
        if (!mapDiv.value) return;

        mapInstance = new google.maps.Map(mapDiv.value, {
            center: { lat: -7.150975, lng: 110.140259 }, // Pusat Jateng
            zoom: 8,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
        });

        // Add markers
        if (data.terbaru) {
            data.terbaru.forEach((aduan: any) => {
                if (aduan.latitude && aduan.longitude) {
                    const marker = new google.maps.Marker({
                        map: mapInstance!,
                        position: { lat: parseFloat(aduan.latitude), lng: parseFloat(aduan.longitude) },
                        title: aduan.ticket_number,
                    });
                    markers.push(marker);

                    const infoWindow = new google.maps.InfoWindow({
                        content: `
                            <div class="p-2 font-sans text-xs">
                                <strong>${aduan.ticket_number}</strong><br/>
                                Toko: ${aduan.nama_toko}<br/>
                                Status: ${statusLabel[aduan.status] || aduan.status}<br/>
                                <a href="/admin/aduan/${aduan.id}" style="color: blue; text-decoration: underline;">Lihat Detail</a>
                            </div>
                        `,
                    });

                    marker.addListener('click', () => {
                        infoWindow.open(mapInstance!, marker);
                    });
                }
            });
        }
    } catch (e) {
        error.value = 'Gagal memuat data dashboard.';
        console.error(e);
    } finally {
        loading.value = false;
    }
});

onUnmounted(() => {
    markers.forEach((m) => google.maps.event.clearInstanceListeners(m));
    if (mapInstance) {
        google.maps.event.clearInstanceListeners(mapInstance);
        mapInstance = null;
    }
});
</script>

<template>
    <AdminLayout>
        <div v-if="loading" class="text-center py-10 text-muted-foreground">Memuat data dashboard...</div>
        <div v-else-if="error" class="text-center py-10 text-destructive">{{ error }}</div>
        <div v-else class="space-y-6">
            <h2 class="text-3xl font-bold tracking-tight">Dashboard Overview</h2>

            <!-- KPI Cards -->
            <StatsCards :stats="stats" />

            <!-- Row 2: Status Breakdown and Map -->
            <div class="grid gap-4 md:grid-cols-3">
                <Card class="border md:col-span-1 shadow-sm">
                    <CardHeader>
                        <CardTitle class="text-lg">Status Laporan</CardTitle>
                        <CardDescription>Komposisi status penanganan aduan</CardDescription>
                    </CardHeader>
                    <CardContent class="space-y-4 pt-2">
                        <div v-for="(val, status) in stats.per_status" :key="status" class="space-y-1">
                            <div class="flex justify-between text-sm">
                                <span class="capitalize font-medium">{{ statusLabel[status] || status }}</span>
                                <span class="text-muted-foreground">{{ val }} Laporan</span>
                            </div>
                            <!-- Simple custom progress bar -->
                            <div class="w-full h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                    class="h-full rounded-full" 
                                    :class="{
                                        'bg-blue-600': String(status) === 'baru',
                                        'bg-amber-600': String(status) === 'diproses',
                                        'bg-green-600': String(status) === 'selesai',
                                        'bg-red-600': String(status) === 'ditolak',
                                    }"
                                    :style="{ width: `${stats.total > 0 ? (val / stats.total) * 100 : 0}%` }"
                                ></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card class="border md:col-span-2 shadow-sm">
                    <CardHeader>
                        <CardTitle class="text-lg">Peta Persebaran</CardTitle>
                        <CardDescription>Lokasi peredaran rokok ilegal yang dilaporkan</CardDescription>
                    </CardHeader>
                    <CardContent class="pt-0">
                        <div ref="mapDiv" class="w-full h-[280px] rounded-md border" />
                    </CardContent>
                </Card>
            </div>

            <!-- Row 3: Recent List -->
            <Card class="border shadow-sm">
                <CardHeader>
                    <CardTitle class="text-lg">10 Laporan Terbaru</CardTitle>
                    <CardDescription>Aduan yang baru saja masuk ke sistem</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table class="border-t">
                        <TableHeader>
                            <TableRow>
                                <TableHead>No Tiket</TableHead>
                                <TableHead>Pelapor</TableHead>
                                <TableHead>Kab/Kota</TableHead>
                                <TableHead>Jenis Rokok</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead class="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow v-for="aduan in stats.terbaru" :key="aduan.id" class="cursor-pointer hover:bg-muted/50" @click="router.push(`/admin/aduan/${aduan.id}`)">
                                <TableCell class="font-mono font-medium">{{ aduan.ticket_number }}</TableCell>
                                <TableCell>{{ aduan.nama_pelapor }}</TableCell>
                                <TableCell>{{ aduan.kabupaten_kota }}</TableCell>
                                <TableCell class="capitalize">{{ aduan.jenis_rokok.replace('_', ' ') }}</TableCell>
                                <TableCell>
                                    <Badge :variant="statusVariant[aduan.status]">{{ statusLabel[aduan.status] || aduan.status }}</Badge>
                                </TableCell>
                                <TableCell>{{ new Date(aduan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }}</TableCell>
                                <TableCell class="text-right">
                                    <Button variant="ghost" size="sm" type="button" @click.stop="router.push(`/admin/aduan/${aduan.id}`)">Detail →</Button>
                                </TableCell>
                            </TableRow>
                            <template v-if="!stats.terbaru || stats.terbaru.length === 0">
                                <TableRow>
                                    <TableCell colspan="7" class="text-center py-6 text-muted-foreground">Tidak ada data aduan.</TableCell>
                                </TableRow>
                            </template>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    </AdminLayout>
</template>

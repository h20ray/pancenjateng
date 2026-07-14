<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import AdminLayout from '@/components/admin/AdminLayout.vue';
import StatsCards from '@/components/admin/StatsCards.vue';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { loadGoogleMaps } from '@/services/googleMapsLoader';
import { statusVariant } from '@/lib/constants';
import { useI18n } from 'vue-i18n';
import api from '@/services/api';
import { useRouter } from 'vue-router';

const router = useRouter();
const stats = ref<any>(null);
const loading = ref(true);
const error = ref('');
const { t } = useI18n();
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
                                ${t('dashboard.map_shop')}: ${aduan.nama_toko}<br/>
                                ${t('dashboard.map_status')}: ${t('label.status_' + aduan.status)}<br/>
                                <a href="/admin/aduan/${aduan.id}" style="color: blue; text-decoration: underline;">${t('button.view_detail')}</a>
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
        error.value = t('message.load_dashboard_failed');
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
        <div v-if="loading" class="text-center py-10 text-muted-foreground">{{ $t('message.loading_dashboard') }}</div>
        <div v-else-if="error" class="text-center py-10 text-destructive">{{ error }}</div>
        <div v-else class="space-y-5">

            <!-- KPI Cards -->
            <StatsCards :stats="stats" />

            <!-- Row 2: Status Breakdown and Map -->
            <div class="grid gap-5 md:grid-cols-3">
                <Card class="border md:col-span-1 shadow-xs gap-0">
                    <CardHeader class="border-b px-5 min-h-14 flex flex-col justify-center gap-1">
                        <CardTitle class="text-base font-semibold leading-none tracking-tight">{{ $t('dashboard.status_title') }}</CardTitle>
                        <CardDescription>{{ $t('dashboard.status_subtitle') }}</CardDescription>
                    </CardHeader>
                    <CardContent class="space-y-4 p-5">
                        <div v-for="(val, status) in stats.per_status" :key="status" class="space-y-1">
                            <div class="flex justify-between text-sm">
                                <span class="capitalize font-medium">{{ $t('label.status_' + status) }}</span>
                                <span class="text-muted-foreground">{{ val }} {{ $t('dashboard.reports_count') }}</span>
                            </div>
                            <!-- Simple custom progress bar -->
                            <div class="w-full h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                    class="h-full rounded-full" 
                                    :class="{
                                        'bg-primary': String(status) === 'baru',
                                        'bg-amber-500': String(status) === 'diproses',
                                        'bg-green-500': String(status) === 'selesai',
                                        'bg-destructive': String(status) === 'ditolak',
                                    }"
                                    :style="{ width: `${stats.total > 0 ? (val / stats.total) * 100 : 0}%` }"
                                ></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card class="border md:col-span-2 shadow-xs gap-0">
                    <CardHeader class="border-b px-5 min-h-14 flex flex-col justify-center gap-1">
                        <CardTitle class="text-base font-semibold leading-none tracking-tight">{{ $t('dashboard.map_title') }}</CardTitle>
                        <CardDescription>{{ $t('dashboard.map_subtitle') }}</CardDescription>
                    </CardHeader>
                    <CardContent class="p-5">
                        <div ref="mapDiv" class="w-full h-[300px] rounded-md border" />
                    </CardContent>
                </Card>
            </div>

            <!-- Row 3: Recent List -->
            <Card class="border shadow-xs gap-0">
                <CardHeader class="border-b px-5 min-h-14 flex flex-col justify-center gap-1">
                    <CardTitle class="text-base font-semibold leading-none tracking-tight">{{ $t('dashboard.recent_title') }}</CardTitle>
                    <CardDescription>{{ $t('dashboard.recent_subtitle') }}</CardDescription>
                </CardHeader>
                <CardContent class="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{{ $t('label.ticket_no') }}</TableHead>
                                <TableHead class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{{ $t('label.reporter') }}</TableHead>
                                <TableHead class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{{ $t('label.city') }}</TableHead>
                                <TableHead class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{{ $t('label.cigarette_type') }}</TableHead>
                                <TableHead class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{{ $t('label.status') }}</TableHead>
                                <TableHead class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{{ $t('label.date') }}</TableHead>
                                <TableHead class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">{{ $t('label.action') }}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow v-for="aduan in stats.terbaru" :key="aduan.id" class="cursor-pointer hover:bg-muted/30" @click="router.push(`/admin/aduan/${aduan.id}`)">
                                <TableCell class="px-5 py-3.5 font-mono font-medium">{{ aduan.ticket_number }}</TableCell>
                                <TableCell class="px-5 py-3.5">{{ aduan.nama_pelapor }}</TableCell>
                                <TableCell class="px-5 py-3.5">{{ aduan.kabupaten_kota }}</TableCell>
                                <TableCell class="px-5 py-3.5 capitalize">{{ $t('label.jenis_' + aduan.jenis_rokok) }}</TableCell>
                                <TableCell class="px-5 py-3.5">
                                    <Badge :variant="statusVariant[aduan.status]">{{ $t('label.status_' + aduan.status) }}</Badge>
                                </TableCell>
                                <TableCell class="px-5 py-3.5">{{ new Date(aduan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }}</TableCell>
                                <TableCell class="px-5 py-3.5 text-right">
                                    <Button variant="ghost" size="sm" type="button" @click.stop="router.push(`/admin/aduan/${aduan.id}`)">{{ $t('button.detail') }} →</Button>
                                </TableCell>
                            </TableRow>
                            <template v-if="!stats.terbaru || stats.terbaru.length === 0">
                                <TableRow>
                                    <TableCell colspan="7" class="text-center py-6 text-muted-foreground">{{ $t('message.no_aduan') }}</TableCell>
                                </TableRow>
                            </template>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    </AdminLayout>
</template>

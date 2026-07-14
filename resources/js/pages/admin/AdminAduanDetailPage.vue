<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AdminLayout from '@/components/admin/AdminLayout.vue';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { loadGoogleMaps } from '@/services/googleMapsLoader';
import { toast } from 'vue-sonner';
import api from '@/services/api';

const route = useRoute();
const router = useRouter();
const id = route.params.id as string;

const aduan = ref<any>(null);
const loading = ref(true);
const error = ref('');
const saving = ref(false);
const resendingWa = ref(false);
const mapDiv = ref<HTMLDivElement>();
let mapInstance: google.maps.Map | null = null;
let markerInstance: google.maps.Marker | null = null;
let mapTimer: ReturnType<typeof setTimeout> | null = null;

const statusOptions = [
    { value: 'baru', label: 'Baru' },
    { value: 'diproses', label: 'Sedang Diproses' },
    { value: 'selesai', label: 'Selesai' },
    { value: 'ditolak', label: 'Ditolak' },
];

import { statusLabel, statusVariant, jenisLabel } from '@/lib/constants';

async function loadData() {
    try {
        const { data } = await api.get(`/admin/aduan/${id}`);
        aduan.value = data;

        if (data.latitude && data.longitude && mapDiv.value) {
            await nextTick();
            const google = await loadGoogleMaps();
            if (!mapDiv.value) return;
            const position = { lat: parseFloat(data.latitude), lng: parseFloat(data.longitude) };

            mapInstance = new google.maps.Map(mapDiv.value, {
                center: position,
                zoom: 15,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
            });

            markerInstance = new google.maps.Marker({
                map: mapInstance,
                position,
                title: data.ticket_number,
            });
        }
    } catch {
        error.value = 'Gagal memuat detail aduan.';
    } finally {
        loading.value = false;
    }
}

onMounted(loadData);

onUnmounted(() => {
    if (mapTimer) clearTimeout(mapTimer);
    if (markerInstance) google.maps.event.clearInstanceListeners(markerInstance);
    if (mapInstance) {
        google.maps.event.clearInstanceListeners(mapInstance);
        mapInstance = null;
    }
});

async function saveStatus() {
    saving.value = true;
    try {
        await api.patch(`/admin/aduan/${id}`, {
            status: aduan.value.status,
            catatan_admin: aduan.value.catatan_admin,
        });
        toast.success('Status aduan berhasil diperbarui!');
    } catch {
        toast.error('Gagal memperbarui status.');
    } finally {
        saving.value = false;
    }
}

async function resendWa() {
    resendingWa.value = true;
    try {
        const { data } = await api.post(`/admin/aduan/${id}/resend-wa`);
        aduan.value.whatsapp_status = data.whatsapp_status;
        aduan.value.whatsapp_sent_at = data.whatsapp_sent_at;
        if (data.whatsapp_status === 'sent') {
            toast.success('WhatsApp berhasil dikirim ulang!');
        } else {
            toast.error('WhatsApp gagal terkirim.');
        }
    } catch {
        toast.error('Gagal memicu pengiriman ulang WhatsApp.');
    } finally {
        resendingWa.value = false;
    }
}

async function deleteAduan() {
    if (!confirm('Apakah Anda yakin ingin menghapus aduan ini?')) return;
    try {
        await api.delete(`/admin/aduan/${id}`);
        toast.success('Aduan berhasil dihapus.');
        router.push('/admin/aduan');
    } catch {
        toast.error('Gagal menghapus aduan.');
    }
}
</script>

<template>
    <AdminLayout>
        <div v-if="loading" class="text-center py-10 text-muted-foreground">Memuat detail aduan...</div>
        <div v-else-if="error" class="text-center py-10 text-destructive">{{ error }}</div>
        <div v-else class="space-y-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div class="flex items-center gap-3">
                        <h2 class="text-3xl font-bold tracking-tight">{{ aduan.ticket_number }}</h2>
                        <Badge :variant="statusVariant[aduan.status]">{{ statusLabel[aduan.status] || aduan.status }}</Badge>
                    </div>
                    <p class="text-muted-foreground">Dilaporkan pada {{ new Date(aduan.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }} WIB</p>
                </div>
                <Button variant="destructive" type="button" @click="deleteAduan">
                    🗑️ Hapus Laporan
                </Button>
            </div>

            <div class="grid gap-6 md:grid-cols-3">
                <!-- Col 1 & 2: Detail Laporan -->
                <div class="md:col-span-2 space-y-6">
                    <Card class="border shadow-sm">
                        <CardHeader>
                            <CardTitle class="text-lg">Informasi Kejadian</CardTitle>
                        </CardHeader>
                        <CardContent class="grid gap-4 sm:grid-cols-2 text-sm">
                            <div>
                                <label class="text-muted-foreground block mb-0.5">Toko / Warung</label>
                                <span class="font-semibold text-base">{{ aduan.nama_toko }}</span>
                            </div>
                            <div>
                                <label class="text-muted-foreground block mb-0.5">Kabupaten / Kota</label>
                                <span class="font-semibold text-base">{{ aduan.kabupaten_kota }}</span>
                            </div>
                            <div class="sm:col-span-2">
                                <label class="text-muted-foreground block mb-0.5">Alamat Lengkap</label>
                                <span class="font-medium">{{ aduan.lokasi_kejadian }}</span>
                            </div>
                            <div>
                                <label class="text-muted-foreground block mb-0.5">Jenis Rokok</label>
                                <span class="font-medium capitalize">{{ jenisLabel[aduan.jenis_rokok] || aduan.jenis_rokok.replace('_', ' ') }}</span>
                            </div>
                            <div>
                                <label class="text-muted-foreground block mb-0.5">Merk Rokok</label>
                                <span class="font-medium">{{ aduan.merk_rokok }}</span>
                            </div>
                            <div class="sm:col-span-2">
                                <label class="text-muted-foreground block mb-0.5">Detail Pelanggaran</label>
                                <p class="bg-muted/40 p-3 rounded border text-sm leading-relaxed whitespace-pre-line">{{ aduan.detail_aduan }}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card v-if="aduan.foto_bukti" class="border shadow-sm">
                        <CardHeader>
                            <CardTitle class="text-lg">Foto Bukti</CardTitle>
                        </CardHeader>
                        <CardContent class="flex justify-center">
                            <img :src="aduan.foto_bukti" alt="Foto Bukti Rokok Ilegal" class="max-h-[400px] object-contain rounded-md border" />
                        </CardContent>
                    </Card>

                    <Card v-if="aduan.latitude && aduan.longitude" class="border shadow-sm">
                        <CardHeader>
                            <CardTitle class="text-lg">Lokasi Peta</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div ref="mapDiv" class="w-full h-[300px] rounded-md border" />
                        </CardContent>
                    </Card>
                </div>

                <!-- Col 3: Admin Tindakan & Pelapor -->
                <div class="space-y-6">
                    <!-- Tindakan Admin -->
                    <Card class="border shadow-sm">
                        <CardHeader>
                            <CardTitle class="text-lg">Tindak Lanjut</CardTitle>
                            <CardDescription>Perbarui status dan catatan internal</CardDescription>
                        </CardHeader>
                        <form @submit.prevent="saveStatus">
                            <CardContent class="space-y-4">
                                <div class="space-y-1">
                                    <label class="text-xs font-semibold">Ubah Status</label>
                                    <Select v-model="aduan.status">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                                                {{ opt.label }}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div class="space-y-1">
                                    <label class="text-xs font-semibold">Catatan Internal</label>
                                    <Textarea v-model="aduan.catatan_admin" placeholder="Catatan penyelidikan / penanganan..." rows="4" />
                                </div>
                            </CardContent>
                            <CardContent class="pt-0">
                                <Button type="submit" class="w-full" :disabled="saving">
                                    {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
                                </Button>
                            </CardContent>
                        </form>
                    </Card>

                    <!-- Identitas Pelapor -->
                    <Card class="border shadow-sm">
                        <CardHeader>
                            <CardTitle class="text-lg">Profil Pelapor</CardTitle>
                            <CardDescription>Hanya dapat dilihat oleh admin</CardDescription>
                        </CardHeader>
                        <CardContent class="space-y-3 text-sm">
                            <div>
                                <label class="text-muted-foreground block text-xs">Nama Lengkap</label>
                                <span class="font-medium">{{ aduan.nama_pelapor }}</span>
                            </div>
                            <div>
                                <label class="text-muted-foreground block text-xs">Email</label>
                                <span class="font-medium">{{ aduan.email || '(tidak diisi)' }}</span>
                            </div>
                            <div>
                                <label class="text-muted-foreground block text-xs">Nomor WhatsApp</label>
                                <a :href="`https://wa.me/${aduan.nomor_wa}`" target="_blank" class="text-blue-600 hover:underline font-mono">
                                    {{ aduan.nomor_wa }} ↗
                                </a>
                            </div>
                        </CardContent>
                    </Card>

                    <!-- WhatsApp Status -->
                    <Card class="border shadow-sm">
                        <CardHeader>
                            <CardTitle class="text-lg">Status Notifikasi WA</CardTitle>
                            <CardDescription>Pengiriman ringkasan aduan ke grup admin</CardDescription>
                        </CardHeader>
                        <CardContent class="space-y-3 text-sm">
                            <div class="flex items-center gap-2">
                                <span class="text-muted-foreground">Status WA:</span>
                                <Badge :variant="aduan.whatsapp_status === 'sent' ? 'default' : 'destructive'" class="capitalize">
                                    {{ aduan.whatsapp_status || 'Pending' }}
                                </Badge>
                            </div>
                            <div v-if="aduan.whatsapp_sent_at" class="text-xs text-muted-foreground">
                                Terkirim: {{ new Date(aduan.whatsapp_sent_at).toLocaleString('id-ID') }}
                            </div>
                            <Button 
                                type="button" 
                                variant="outline" 
                                class="w-full" 
                                :disabled="resendingWa" 
                                @click="resendWa"
                            >
                                {{ resendingWa ? 'Mengirim...' : '🔄 Kirim Ulang WA' }}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import AdminLayout from '@/components/admin/AdminLayout.vue';
import AduanTable from '@/components/admin/AduanTable.vue';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/services/api';
import { toast } from 'vue-sonner';

const aduans = ref<any[]>([]);
const pagination = ref<any>({});
const loading = ref(true);
const error = ref('');

// Filters
const search = ref('');
const status = ref('all');
const kabupaten = ref('all');
const jenisRokok = ref('all');
const page = ref(1);

const cities = ref<{ kode: string; nama: string }[]>([]);

const jenisRokokOptions = [
    { value: 'all', label: 'Semua Jenis' },
    { value: 'sigaret_mesin', label: 'Sigaret Mesin' },
    { value: 'sigaret_tangan', label: 'Sigaret Tangan' },
    { value: 'tembakau_iris', label: 'Tembakau Iris' },
    { value: 'cerutu', label: 'Cerutu' },
    { value: 'lainnya', label: 'Lainnya' },
];

const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: 'baru', label: 'Baru' },
    { value: 'diproses', label: 'Sedang Diproses' },
    { value: 'selesai', label: 'Selesai' },
    { value: 'ditolak', label: 'Ditolak' },
];

async function loadData() {
    loading.value = true;
    error.value = '';

    const params: Record<string, any> = {
        page: page.value,
    };

    if (search.value) params.search = search.value;
    if (status.value !== 'all') params.status = status.value;
    if (kabupaten.value !== 'all') params.kabupaten = kabupaten.value;
    if (jenisRokok.value !== 'all') params.jenis_rokok = jenisRokok.value;

    try {
        const { data } = await api.get('/admin/aduan', { params });
        aduans.value = data.data;
        pagination.value = {
            current_page: data.current_page,
            last_page: data.last_page,
            total: data.total,
        };
    } catch {
        error.value = 'Gagal memuat data aduan.';
    } finally {
        loading.value = false;
    }
}

onMounted(async () => {
    try {
        const { data } = await api.get('/kabupaten-kota');
        cities.value = data;
    } catch (e) {
        console.error(e);
    }
    loadData();
});

watch([status, kabupaten, jenisRokok], () => {
    page.value = 1;
    loadData();
});

async function exportData() {
    const params: Record<string, any> = {};
    if (search.value) params.search = search.value;
    if (status.value !== 'all') params.status = status.value;
    if (kabupaten.value !== 'all') params.kabupaten = kabupaten.value;
    if (jenisRokok.value !== 'all') params.jenis_rokok = jenisRokok.value;

    try {
        const response = await api.get('/admin/aduan/export', {
            params,
            responseType: 'blob'
        });
        
        const blob = new Blob([response.data], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `laporan-rokok-ilegal-${new Date().toISOString().slice(0,19).replace(/[:T]/g, '-')}.csv`;
        link.click();
        window.URL.revokeObjectURL(link.href);
    } catch (e) {
        toast.error('Gagal mengekspor data CSV.');
        console.error('Export failed', e);
    }
}
</script>

<template>
    <AdminLayout>
        <div class="space-y-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-3xl font-bold tracking-tight">Daftar Aduan</h2>
                    <p class="text-muted-foreground">Kelola dan tindaklanjuti laporan masyarakat</p>
                </div>
                <Button type="button" @click="exportData">
                    📥 Export CSV
                </Button>
            </div>

            <!-- Filters Bar -->
            <Card class="border shadow-sm">
                <CardContent class="p-4 grid gap-4 sm:grid-cols-4">
                    <div class="space-y-1">
                        <label class="text-xs font-semibold">Pencarian</label>
                        <Input 
                            v-model="search" 
                            placeholder="Cari tiket, pelapor..." 
                            @keydown.enter="loadData"
                        />
                    </div>
                    
                    <div class="space-y-1">
                        <label class="text-xs font-semibold">Status</label>
                        <Select v-model="status">
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
                        <label class="text-xs font-semibold">Kabupaten/Kota</label>
                        <Select v-model="kabupaten">
                            <SelectTrigger>
                                <SelectValue placeholder="Semua Kabupaten/Kota" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Kabupaten/Kota</SelectItem>
                                <SelectItem v-for="city in cities" :key="city.kode" :value="city.nama">
                                    {{ city.nama }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div class="space-y-1">
                        <label class="text-xs font-semibold">Jenis Rokok</label>
                        <Select v-model="jenisRokok">
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem v-for="opt in jenisRokokOptions" :key="opt.value" :value="opt.value">
                                    {{ opt.label }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <!-- Table Card -->
            <div v-if="loading" class="text-center py-10 text-muted-foreground">Memuat data aduan...</div>
            <div v-else-if="error" class="text-center py-10 text-destructive">{{ error }}</div>
            <div v-else class="space-y-4">
                <AduanTable :aduans="aduans" />

                <!-- Pagination -->
                <div class="flex justify-between items-center text-sm text-muted-foreground pt-2">
                    <div>Total: {{ pagination.total }} Laporan</div>
                    <div class="flex gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            :disabled="page === 1" 
                            @click="page--; loadData();"
                        >
                            Sebelumnya
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            :disabled="page >= pagination.last_page" 
                            @click="page++; loadData();"
                        >
                            Berikutnya
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </AdminLayout>
</template>

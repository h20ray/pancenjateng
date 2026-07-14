<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import AdminLayout from '@/components/admin/AdminLayout.vue';
import AduanTable from '@/components/admin/AduanTable.vue';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/services/api';
import { toast } from 'vue-sonner';
import { useI18n } from 'vue-i18n';

const aduans = ref<any[]>([]);
const pagination = ref<any>({});
const loading = ref(true);
const error = ref('');
const { t } = useI18n();

// Filters
const search = ref('');
const status = ref('all');
const kabupaten = ref('all');
const jenisRokok = ref('all');
const page = ref(1);

const cities = ref<{ kode: string; nama: string }[]>([]);

const jenisRokokOptions = computed(() => [
    { value: 'all', label: t('label.all_types') },
    { value: 'sigaret_mesin', label: t('label.jenis_sigaret_mesin') },
    { value: 'sigaret_tangan', label: t('label.jenis_sigaret_tangan') },
    { value: 'tembakau_iris', label: t('label.jenis_tembakau_iris') },
    { value: 'cerutu', label: t('label.jenis_cerutu') },
    { value: 'lainnya', label: t('label.jenis_lainnya') },
]);

const statusOptions = computed(() => [
    { value: 'all', label: t('label.all_statuses') },
    { value: 'baru', label: t('label.status_baru') },
    { value: 'diproses', label: t('label.status_diproses') },
    { value: 'selesai', label: t('label.status_selesai') },
    { value: 'ditolak', label: t('label.status_ditolak') },
]);

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
        error.value = t('message.load_aduan_failed');
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
        toast.error(t('message.export_csv_failed'));
        console.error('Export failed', e);
    }
}
</script>

<template>
    <AdminLayout>
        <template #actions>
            <Button type="button" @click="exportData" variant="outline" size="sm" class="flex items-center gap-1.5 font-semibold text-xs rounded-lg">
                <i class="ki-outline ki-file-down text-base"></i>
                {{ $t('button.export_csv') }}
            </Button>
        </template>

        <div class="space-y-6">

            <!-- Filters Bar -->
            <Card class="border shadow-sm">
                <CardContent class="p-4 grid gap-4 sm:grid-cols-4">
                    <div class="space-y-1">
                        <label class="text-xs font-semibold">{{ $t('label.search') }}</label>
                        <Input 
                            v-model="search" 
                            :placeholder="$t('label.search_placeholder_aduan')" 
                            @keydown.enter="loadData"
                        />
                    </div>
                    
                    <div class="space-y-1">
                        <label class="text-xs font-semibold">{{ $t('label.status') }}</label>
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
                        <label class="text-xs font-semibold">{{ $t('label.city') }}</label>
                        <Select v-model="kabupaten">
                            <SelectTrigger>
                                <SelectValue :placeholder="$t('label.all_cities')" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{{ $t('label.all_cities') }}</SelectItem>
                                <SelectItem v-for="city in cities" :key="city.kode" :value="city.nama">
                                    {{ city.nama }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div class="space-y-1">
                        <label class="text-xs font-semibold">{{ $t('label.cigarette_type') }}</label>
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
            <div v-if="loading" class="text-center py-10 text-muted-foreground">{{ $t('message.loading_aduan') }}</div>
            <div v-else-if="error" class="text-center py-10 text-destructive">{{ error }}</div>
            <div v-else class="space-y-4">
                <AduanTable :aduans="aduans" />

                <!-- Pagination -->
                <div class="flex justify-between items-center text-sm text-muted-foreground pt-2">
                    <div>Total: {{ pagination.total }} {{ $t('label.reports') }}</div>
                    <div class="flex gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            :disabled="page === 1" 
                            @click="page--; loadData();"
                        >
                            {{ $t('button.previous') }}
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            :disabled="page >= pagination.last_page" 
                            @click="page++; loadData();"
                        >
                            {{ $t('button.next') }}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </AdminLayout>
</template>

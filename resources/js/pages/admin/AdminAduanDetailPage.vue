<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AdminLayout from '@/components/admin/AdminLayout.vue';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { loadGoogleMaps } from '@/services/googleMapsLoader';
import { toast } from 'vue-sonner';
import { useI18n } from 'vue-i18n';
import api from '@/services/api';
import { statusVariant } from '@/lib/constants';

const route = useRoute();
const router = useRouter();
const id = route.params.id as string;
const { t } = useI18n();

const aduan = ref<any>(null);
const loading = ref(true);
const error = ref('');
const saving = ref(false);
const resendingWa = ref(false);
const mapDiv = ref<HTMLDivElement>();
let mapInstance: google.maps.Map | null = null;
let markerInstance: google.maps.Marker | null = null;
let mapTimer: ReturnType<typeof setTimeout> | null = null;

const statusOptions = computed(() => [
    { value: 'baru', label: t('label.status_baru') },
    { value: 'diproses', label: t('label.status_diproses') },
    { value: 'selesai', label: t('label.status_selesai') },
    { value: 'ditolak', label: t('label.status_ditolak') },
]);

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
        error.value = t('message.load_aduan_detail_failed');
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
        toast.success(t('message.status_updated'));
    } catch {
        toast.error(t('message.status_update_failed'));
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
            toast.success(t('message.wa_resent_success'));
        } else {
            toast.error(t('message.wa_send_failed'));
        }
    } catch {
        toast.error(t('message.wa_resend_trigger_failed'));
    } finally {
        resendingWa.value = false;
    }
}

async function deleteAduan() {
    if (!confirm(t('message.delete_confirm'))) return;
    try {
        await api.delete(`/admin/aduan/${id}`);
        toast.success(t('message.delete_success'));
        router.push('/admin/aduan');
    } catch {
        toast.error(t('message.delete_failed'));
    }
}
</script>

<template>
    <AdminLayout>
        <template #actions v-if="aduan">
            <Button variant="destructive" size="sm" type="button" @click="deleteAduan" class="flex items-center gap-1.5 font-semibold text-xs rounded-lg">
                <i class="ki-outline ki-trash text-base"></i>
                {{ $t('button.delete_report') }}
            </Button>
        </template>

        <div v-if="loading" class="text-center py-10 text-muted-foreground">{{ $t('message.loading_detail') }}</div>
        <div v-else-if="error" class="text-center py-10 text-destructive">{{ error }}</div>
        <div v-else class="space-y-6">
            <div class="mb-4">
                <div class="flex items-center gap-3 mb-1">
                    <h2 class="text-2xl font-bold tracking-tight">{{ aduan.ticket_number }}</h2>
                    <Badge :variant="statusVariant[aduan.status]">{{ $t('label.status_' + aduan.status) }}</Badge>
                </div>
                <p class="text-xs text-muted-foreground">
                    {{ $t('label.reported_at') }} {{ new Date(aduan.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }} WIB
                </p>
            </div>

            <div class="grid gap-6 md:grid-cols-3">
                <!-- Col 1 & 2: Detail Laporan -->
                <div class="md:col-span-2 space-y-6">
                    <Card class="border shadow-sm">
                        <CardHeader>
                            <CardTitle class="text-lg">{{ $t('aduan.event_info') }}</CardTitle>
                        </CardHeader>
                        <CardContent class="grid gap-4 sm:grid-cols-2 text-sm">
                            <div>
                                <label class="text-muted-foreground block mb-0.5">{{ $t('label.shop') }}</label>
                                <span class="font-semibold text-base">{{ aduan.nama_toko }}</span>
                            </div>
                            <div>
                                <label class="text-muted-foreground block mb-0.5">{{ $t('label.city_kab') }}</label>
                                <span class="font-semibold text-base">{{ aduan.kabupaten_kota }}</span>
                            </div>
                            <div class="sm:col-span-2">
                                <label class="text-muted-foreground block mb-0.5">{{ $t('label.address') }}</label>
                                <span class="font-medium">{{ aduan.lokasi_kejadian }}</span>
                            </div>
                            <div>
                                <label class="text-muted-foreground block mb-0.5">{{ $t('label.cigarette_type') }}</label>
                                <span class="font-medium capitalize">{{ $t('label.jenis_' + aduan.jenis_rokok) }}</span>
                            </div>
                            <div>
                                <label class="text-muted-foreground block mb-0.5">{{ $t('label.brand') }}</label>
                                <span class="font-medium">{{ aduan.merk_rokok }}</span>
                            </div>
                            <div class="sm:col-span-2">
                                <label class="text-muted-foreground block mb-0.5">{{ $t('label.violation_detail') }}</label>
                                <p class="bg-muted/40 p-3 rounded border text-sm leading-relaxed whitespace-pre-line">{{ aduan.detail_aduan }}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card v-if="aduan.foto_bukti" class="border shadow-sm">
                        <CardHeader>
                            <CardTitle class="text-lg">{{ $t('aduan.evidence_photo') }}</CardTitle>
                        </CardHeader>
                        <CardContent class="flex justify-center">
                            <img :src="aduan.foto_bukti" :alt="$t('aduan.evidence_photo_alt')" class="max-h-[400px] object-contain rounded-md border" />
                        </CardContent>
                    </Card>

                    <Card v-if="aduan.latitude && aduan.longitude" class="border shadow-sm">
                        <CardHeader>
                            <CardTitle class="text-lg">{{ $t('aduan.map_location') }}</CardTitle>
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
                            <CardTitle class="text-lg">{{ $t('aduan.action_follow_up') }}</CardTitle>
                            <CardDescription>{{ $t('aduan.action_follow_up_desc') }}</CardDescription>
                        </CardHeader>
                        <form @submit.prevent="saveStatus">
                            <CardContent class="space-y-4">
                                <div class="space-y-1">
                                    <label class="text-xs font-semibold">{{ $t('aduan.change_status') }}</label>
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
                                    <label class="text-xs font-semibold">{{ $t('aduan.internal_note') }}</label>
                                    <Textarea v-model="aduan.catatan_admin" :placeholder="$t('aduan.internal_note_placeholder')" rows="4" />
                                </div>
                            </CardContent>
                            <CardContent class="pt-0">
                                <Button type="submit" class="w-full" :disabled="saving">
                                    {{ saving ? $t('button.saving') : $t('button.save_changes') }}
                                </Button>
                            </CardContent>
                        </form>
                    </Card>

                    <!-- Identitas Pelapor -->
                    <Card class="border shadow-sm">
                        <CardHeader>
                            <CardTitle class="text-lg">{{ $t('aduan.reporter_profile') }}</CardTitle>
                            <CardDescription>{{ $t('aduan.reporter_profile_desc') }}</CardDescription>
                        </CardHeader>
                        <CardContent class="space-y-3 text-sm">
                            <div>
                                <label class="text-muted-foreground block text-xs">{{ $t('label.full_name') }}</label>
                                <span class="font-medium">{{ aduan.nama_pelapor }}</span>
                            </div>
                            <div>
                                <label class="text-muted-foreground block text-xs">{{ $t('label.email') }}</label>
                                <span class="font-medium">{{ aduan.email || $t('label.not_filled') }}</span>
                            </div>
                            <div>
                                <label class="text-muted-foreground block text-xs">{{ $t('label.whatsapp_number') }}</label>
                                <a :href="`https://wa.me/${aduan.nomor_wa}`" target="_blank" class="text-blue-600 hover:underline font-mono">
                                    {{ aduan.nomor_wa }} ↗
                                </a>
                            </div>
                        </CardContent>
                    </Card>

                    <!-- WhatsApp Status -->
                    <Card class="border shadow-sm">
                        <CardHeader>
                            <CardTitle class="text-lg">{{ $t('aduan.wa_status_title') }}</CardTitle>
                            <CardDescription>{{ $t('aduan.wa_status_desc') }}</CardDescription>
                        </CardHeader>
                        <CardContent class="space-y-3 text-sm">
                            <div class="flex items-center gap-2">
                                <span class="text-muted-foreground">{{ $t('aduan.wa_status') }}:</span>
                                <Badge :variant="aduan.whatsapp_status === 'sent' ? 'default' : 'destructive'" class="capitalize">
                                    {{ aduan.whatsapp_status || $t('label.status_pending') }}
                                </Badge>
                            </div>
                            <div v-if="aduan.whatsapp_sent_at" class="text-xs text-muted-foreground">
                                {{ $t('label.status_sent') }}: {{ new Date(aduan.whatsapp_sent_at).toLocaleString('id-ID') }}
                            </div>
                            <Button 
                                type="button" 
                                variant="outline" 
                                class="w-full flex items-center justify-center gap-1.5 font-semibold text-xs rounded-lg" 
                                :disabled="resendingWa" 
                                @click="resendWa"
                            >
                                <i class="ki-outline ki-arrows-loop text-sm" :class="{ 'animate-spin': resendingWa }"></i>
                                {{ resendingWa ? $t('button.sending') : $t('button.resend_wa') }}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    </AdminLayout>
</template>

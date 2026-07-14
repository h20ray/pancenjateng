<script setup lang="ts">
import { ref } from 'vue';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { statusVariant } from '@/lib/constants';
import { useI18n } from 'vue-i18n';
import api from '@/services/api';

const ticket = ref('');
const phone = ref('');
const loading = ref(false);
const result = ref<any>(null);
const error = ref('');
const { t } = useI18n();

async function track() {
    loading.value = true;
    error.value = '';
    result.value = null;

    try {
        const { data } = await api.get('/aduan/track', {
            params: { ticket: ticket.value, phone: phone.value.replace(/\D/g, '') },
        });
        result.value = data;
    } catch (e: any) {
        if (e.response?.status === 404) {
            error.value = t('message.report_not_found');
        } else {
            error.value = t('message.tracking_failed');
        }
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div class="max-w-lg mx-auto py-16 px-4">
        <h1 class="text-2xl font-bold text-center mb-2">{{ $t('tracking.title') }}</h1>
        <p class="text-muted-foreground text-center mb-8">{{ $t('tracking.subtitle') }}</p>

        <div class="space-y-4 mb-6">
            <div class="space-y-2">
                <Label for="ticket">{{ $t('label.ticket_no') }}</Label>
                <Input id="ticket" v-model="ticket" :placeholder="$t('label.ticket_placeholder')" />
            </div>
            <div class="space-y-2">
                <Label for="track-phone">{{ $t('label.whatsapp_number') }}</Label>
                <Input id="track-phone" v-model="phone" :placeholder="$t('label.whatsapp_placeholder')" />
            </div>
            <Button class="w-full" :disabled="!ticket || !phone || loading" @click="track">
                {{ loading ? $t('button.searching') : $t('button.track') }}
            </Button>
        </div>

        <p v-if="error" class="text-destructive text-center text-sm mb-6">{{ error }}</p>

        <Card v-if="result" class="border">
            <CardHeader>
                <CardTitle class="text-lg">{{ $t('tracking.status_title') }}</CardTitle>
            </CardHeader>
            <CardContent class="space-y-3">
                <div class="flex items-center gap-2">
                    <span class="text-sm text-muted-foreground">{{ $t('label.ticket') }}:</span>
                    <span class="font-mono font-medium">{{ result.ticket_number }}</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-sm text-muted-foreground">{{ $t('label.status_label') }}:</span>
                    <Badge :variant="statusVariant[result.status]">{{ $t('label.status_' + result.status) }}</Badge>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-sm text-muted-foreground">{{ $t('label.city_label') }}:</span>
                    <span>{{ result.kabupaten_kota }}</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-sm text-muted-foreground">{{ $t('label.type_label') }}:</span>
                    <span>{{ $t('label.jenis_' + result.jenis_rokok) }}</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-sm text-muted-foreground">{{ $t('label.reported_label') }}:</span>
                    <span>{{ new Date(result.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }}</span>
                </div>
            </CardContent>
        </Card>
    </div>
</template>

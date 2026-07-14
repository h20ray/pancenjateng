<script setup lang="ts">
import { useWizardStore } from '@/stores/wizardStore';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import api from '@/services/api';

const wizard = useWizardStore();
const router = useRouter();
const { t } = useI18n();
const agreed = ref(false);
const error = ref('');

async function submit() {
    if (!agreed.value) return;

    wizard.isSubmitting = true;
    error.value = '';

    try {
        const { data } = await api.post('/aduan', {
            ...wizard.form,
            nomor_wa: wizard.form.nomor_wa.replace(/\D/g, ''),
        });

        const ticket = data.ticket_number;

        // Construct pre-filled WhatsApp message
        const message = `${t('wizard.wa_greeting')}

${t('label.ticket')}: ${ticket}
${t('label.name_label')}: ${wizard.form.nama_pelapor}
${t('label.wa_label')}: ${wizard.form.nomor_wa}
${t('label.city_kab')}: ${wizard.form.kabupaten_kota}
${t('label.shop')}: ${wizard.form.nama_toko}
${t('label.address')}: ${wizard.form.lokasi_kejadian}
${t('label.cigarette_type')}: ${t('label.jenis_' + wizard.form.jenis_rokok)}
${t('label.brand')}: ${wizard.form.merk_rokok}
${t('label.violation_detail')}: ${wizard.form.detail_aduan}`;

        const waNumber = (import.meta.env.VITE_WA_CONTACT_NUMBER as string) || '628123456789';
        const encodedText = encodeURIComponent(message);
        const waUrl = `https://wa.me/${waNumber}?text=${encodedText}`;

        router.push(`/lapor/berhasil/${ticket}`);
        wizard.resetForm();
        window.open(waUrl, '_blank');
    } catch (e: any) {
        if (e.response?.status === 409) {
            error.value = t('message.duplicate_report');
        } else if (e.response?.status === 422) {
            error.value = t('message.invalid_data');
        } else {
            error.value = t('message.submit_failed');
        }
    } finally {
        wizard.isSubmitting = false;
    }
}
</script>

<template>
    <div class="space-y-6">
        <h2 class="text-lg font-semibold">{{ $t('wizard.step4_title') }}</h2>
        <p class="text-sm text-muted-foreground">{{ $t('wizard.step4_subtitle') }}</p>

        <div class="bg-muted rounded-lg p-4 space-y-2 text-sm border">
            <div><strong>{{ $t('label.name_label') }}:</strong> {{ wizard.form.nama_pelapor }}</div>
            <div v-if="wizard.form.email"><strong>{{ $t('label.email_label') }}:</strong> {{ wizard.form.email }}</div>
            <div><strong>{{ $t('label.wa_label') }}:</strong> {{ wizard.form.nomor_wa }}</div>
            <hr class="my-2 bg-border">
            <div><strong>{{ $t('label.city_label') }}:</strong> {{ wizard.form.kabupaten_kota }}</div>
            <div><strong>{{ $t('label.address_label') }}:</strong> {{ wizard.form.lokasi_kejadian }}</div>
            <div><strong>{{ $t('label.shop_label') }}:</strong> {{ wizard.form.nama_toko }}</div>
            <hr class="my-2 bg-border">
            <div><strong>{{ $t('label.type_label') }}:</strong> {{ $t('label.jenis_' + wizard.form.jenis_rokok) }}</div>
            <div><strong>{{ $t('label.brand_label') }}:</strong> {{ wizard.form.merk_rokok }}</div>
            <div><strong>{{ $t('label.detail_label') }}:</strong> {{ wizard.form.detail_aduan }}</div>
            <div v-if="wizard.form.foto_bukti"><strong>{{ $t('label.photo_label') }}:</strong> {{ $t('label.attached') }}</div>
        </div>

        <div class="flex items-start gap-2">
            <Checkbox id="agree" :checked="agreed" @update:checked="(val: boolean) => agreed = val" />
            <Label for="agree" class="text-sm leading-5 cursor-pointer">
                {{ $t('wizard.declaration') }}
            </Label>
        </div>

        <p v-if="error" class="text-sm text-destructive">{{ error }}</p>

        <div class="flex justify-between pt-4">
            <Button variant="outline" @click="wizard.prevStep()"><!-- eslint-disable-next-line vue/no-parsing-error -->← {{ $t('button.back') }}</Button>
            <Button :disabled="!agreed || wizard.isSubmitting" @click="submit">
                {{ wizard.isSubmitting ? $t('button.sending') : $t('button.submit_report') }}
            </Button>
        </div>
    </div>
</template>

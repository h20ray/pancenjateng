<script setup lang="ts">
import { useWizardStore } from '@/stores/wizardStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import api from '@/services/api';

const wizard = useWizardStore();
const { t } = useI18n();
const uploading = ref(false);
const uploadError = ref('');

const jenisRokokOptions = computed(() => [
    { value: 'sigaret_mesin', label: t('label.jenis_sigaret_mesin_long') },
    { value: 'sigaret_tangan', label: t('label.jenis_sigaret_tangan_long') },
    { value: 'tembakau_iris', label: t('label.jenis_tembakau_iris') },
    { value: 'cerutu', label: t('label.jenis_cerutu') },
    { value: 'lainnya', label: t('label.jenis_lainnya') },
]);

async function onFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        uploadError.value = t('message.file_size_limit');
        return;
    }

    uploading.value = true;
    uploadError.value = '';

    const formData = new FormData();
    formData.append('foto', file);

    try {
        const { data } = await api.post('/aduan/upload', formData);
        wizard.form.foto_bukti = data.path;
    } catch {
        uploadError.value = t('message.upload_failed');
    } finally {
        uploading.value = false;
    }
}
</script>

<template>
    <div class="space-y-6">
        <h2 class="text-lg font-semibold">{{ $t('wizard.step3_title') }}</h2>

        <div class="space-y-3">
            <Label>{{ $t('label.jenis_rokok_required') }}</Label>
            <RadioGroup v-model="wizard.form.jenis_rokok">
                <div v-for="opt in jenisRokokOptions" :key="opt.value" class="flex items-center gap-2">
                    <RadioGroupItem :id="opt.value" :value="opt.value" />
                    <Label :for="opt.value" class="font-normal">{{ opt.label }}</Label>
                </div>
            </RadioGroup>
        </div>

        <div class="space-y-2">
            <Label for="merk">{{ $t('label.brand_required') }}</Label>
            <Input id="merk" v-model="wizard.form.merk_rokok" :placeholder="$t('label.brand_placeholder')" />
        </div>

        <div class="space-y-2">
            <Label for="detail">{{ $t('label.violation_detail_required') }}</Label>
            <Textarea id="detail" v-model="wizard.form.detail_aduan" :placeholder="$t('label.violation_detail_placeholder')" rows="4" />
            <p class="text-xs text-muted-foreground">{{ wizard.form.detail_aduan.length }}/20 {{ $t('label.min_chars') }}</p>
        </div>

        <div class="space-y-2">
            <Label>{{ $t('label.evidence_photo_optional') }}</Label>
            <Input type="file" accept="image/jpeg,image/png,image/webp" @change="onFileChange" />
            <p v-if="uploading" class="text-sm text-muted-foreground">{{ $t('message.uploading') }}</p>
            <p v-if="uploadError" class="text-sm text-destructive">{{ uploadError }}</p>
            <p v-if="wizard.form.foto_bukti" class="text-sm text-green-600">✓ {{ $t('message.uploaded') }}</p>
        </div>

        <div class="flex justify-between pt-4">
            <Button variant="outline" @click="wizard.prevStep()"><!-- eslint-disable-next-line vue/no-parsing-error -->← {{ $t('button.back') }}</Button>
            <Button :disabled="!wizard.canProceedStep3 || uploading" @click="wizard.nextStep()">
                {{ $t('button.review_report') }} →
            </Button>
        </div>
    </div>
</template>

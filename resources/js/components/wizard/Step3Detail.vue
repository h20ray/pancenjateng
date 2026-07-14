<script setup lang="ts">
import { useWizardStore } from '@/stores/wizardStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ref } from 'vue';
import api from '@/services/api';

const wizard = useWizardStore();
const uploading = ref(false);
const uploadError = ref('');

const jenisRokokOptions = [
    { value: 'sigaret_mesin', label: 'Sigaret Mesin (SKM/SPM)' },
    { value: 'sigaret_tangan', label: 'Sigaret Tangan (SKT)' },
    { value: 'tembakau_iris', label: 'Tembakau Iris' },
    { value: 'cerutu', label: 'Cerutu' },
    { value: 'lainnya', label: 'Lainnya' },
];

async function onFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        uploadError.value = 'Ukuran file maksimal 2MB.';
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
        uploadError.value = 'Gagal mengupload foto. Coba lagi.';
    } finally {
        uploading.value = false;
    }
}
</script>

<template>
    <div class="space-y-6">
        <h2 class="text-lg font-semibold">Detail Aduan</h2>

        <div class="space-y-3">
            <Label>Jenis Rokok Ilegal *</Label>
            <RadioGroup v-model="wizard.form.jenis_rokok">
                <div v-for="opt in jenisRokokOptions" :key="opt.value" class="flex items-center gap-2">
                    <RadioGroupItem :id="opt.value" :value="opt.value" />
                    <Label :for="opt.value" class="font-normal">{{ opt.label }}</Label>
                </div>
            </RadioGroup>
        </div>

        <div class="space-y-2">
            <Label for="merk">Merk Rokok *</Label>
            <Input id="merk" v-model="wizard.form.merk_rokok" placeholder="Contoh: Gudang Garam, Djarum, dll." />
        </div>

        <div class="space-y-2">
            <Label for="detail">Detail Aduan *</Label>
            <Textarea id="detail" v-model="wizard.form.detail_aduan" placeholder="Ceritakan kronologi dan detail pelanggaran..." rows="4" />
            <p class="text-xs text-muted-foreground">{{ wizard.form.detail_aduan.length }}/20 karakter minimum</p>
        </div>

        <div class="space-y-2">
            <Label>Foto Bukti (opsional)</Label>
            <Input type="file" accept="image/jpeg,image/png,image/webp" @change="onFileChange" />
            <p v-if="uploading" class="text-sm text-muted-foreground">Mengupload...</p>
            <p v-if="uploadError" class="text-sm text-destructive">{{ uploadError }}</p>
            <p v-if="wizard.form.foto_bukti" class="text-sm text-green-600">✓ Foto terupload</p>
        </div>

        <div class="flex justify-between pt-4">
            <Button variant="outline" @click="wizard.prevStep()">← Kembali</Button>
            <Button :disabled="!wizard.canProceedStep3 || uploading" @click="wizard.nextStep()">
                Review Laporan →
            </Button>
        </div>
    </div>
</template>

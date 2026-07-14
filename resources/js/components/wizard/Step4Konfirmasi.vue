<script setup lang="ts">
import { useWizardStore } from '@/stores/wizardStore';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import api from '@/services/api';

import { jenisLabel } from '@/lib/constants';

const wizard = useWizardStore();
const router = useRouter();
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
        const message = `Halo Satpol PP Jawa Tengah, saya ingin melaporkan temuan rokok ilegal:

No. Tiket: ${ticket}
Nama Pelapor: ${wizard.form.nama_pelapor}
Nomor WA: ${wizard.form.nomor_wa}
Kabupaten/Kota: ${wizard.form.kabupaten_kota}
Nama Toko/Warung: ${wizard.form.nama_toko}
Alamat Lengkap: ${wizard.form.lokasi_kejadian}
Jenis Rokok: ${jenisLabel[wizard.form.jenis_rokok] || wizard.form.jenis_rokok}
Merk Rokok: ${wizard.form.merk_rokok}
Detail Aduan: ${wizard.form.detail_aduan}`;

        const waNumber = (import.meta.env.VITE_WA_CONTACT_NUMBER as string) || '628123456789';
        const encodedText = encodeURIComponent(message);
        const waUrl = `https://wa.me/${waNumber}?text=${encodedText}`;

        router.push(`/lapor/berhasil/${ticket}`);
        wizard.resetForm();
        window.open(waUrl, '_blank');
    } catch (e: any) {
        if (e.response?.status === 409) {
            error.value = 'Laporan serupa sudah dikirim dalam 5 menit terakhir.';
        } else if (e.response?.status === 422) {
            error.value = 'Data tidak valid. Silakan periksa kembali.';
        } else {
            error.value = 'Gagal mengirim laporan. Silakan coba lagi.';
        }
    } finally {
        wizard.isSubmitting = false;
    }
}
</script>

<template>
    <div class="space-y-6">
        <h2 class="text-lg font-semibold">Konfirmasi Laporan</h2>
        <p class="text-sm text-muted-foreground">Periksa kembali data Anda sebelum dikirim.</p>

        <div class="bg-muted rounded-lg p-4 space-y-2 text-sm border">
            <div><strong>Nama:</strong> {{ wizard.form.nama_pelapor }}</div>
            <div v-if="wizard.form.email"><strong>Email:</strong> {{ wizard.form.email }}</div>
            <div><strong>WA:</strong> {{ wizard.form.nomor_wa }}</div>
            <hr class="my-2 bg-border">
            <div><strong>Kab/Kota:</strong> {{ wizard.form.kabupaten_kota }}</div>
            <div><strong>Alamat:</strong> {{ wizard.form.lokasi_kejadian }}</div>
            <div><strong>Toko:</strong> {{ wizard.form.nama_toko }}</div>
            <hr class="my-2 bg-border">
            <div><strong>Jenis:</strong> {{ jenisLabel[wizard.form.jenis_rokok] }}</div>
            <div><strong>Merk:</strong> {{ wizard.form.merk_rokok }}</div>
            <div><strong>Detail:</strong> {{ wizard.form.detail_aduan }}</div>
            <div v-if="wizard.form.foto_bukti"><strong>Foto:</strong> Terlampir</div>
        </div>

        <div class="flex items-start gap-2">
            <Checkbox id="agree" :checked="agreed" @update:checked="(val: boolean) => agreed = val" />
            <Label for="agree" class="text-sm leading-5 cursor-pointer">
                Saya menyatakan bahwa laporan ini benar dan dapat dipertanggungjawabkan.
            </Label>
        </div>

        <p v-if="error" class="text-sm text-destructive">{{ error }}</p>

        <div class="flex justify-between pt-4">
            <Button variant="outline" @click="wizard.prevStep()">← Kembali</Button>
            <Button :disabled="!agreed || wizard.isSubmitting" @click="submit">
                {{ wizard.isSubmitting ? 'Mengirim...' : 'Kirim Laporan' }}
            </Button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useWizardStore } from '@/stores/wizardStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const wizard = useWizardStore();
</script>

<template>
    <div class="space-y-6">
        <div>
            <h2 class="text-lg font-semibold mb-4">Identitas Pelapor</h2>
            <p class="text-sm text-muted-foreground mb-6">Data Anda dirahasiakan dan hanya digunakan untuk verifikasi laporan.</p>
        </div>

        <div class="space-y-2">
            <Label for="nama">Nama Pelapor *</Label>
            <Input id="nama" v-model="wizard.form.nama_pelapor" placeholder="Nama lengkap Anda" />
        </div>

        <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input id="email" v-model="wizard.form.email" type="email" placeholder="email@example.com (opsional)" />
        </div>

        <div class="space-y-2">
            <Label for="wa">Nomor WhatsApp *</Label>
            <Input id="wa" v-model="wizard.form.nomor_wa" placeholder="0812xxxxxxxx" />
            <p class="text-xs text-muted-foreground">Format: 08xx atau 62xx</p>
        </div>

        <div class="flex justify-end pt-4">
            <Button :disabled="!wizard.canProceedStep1" @click="wizard.nextStep()">
                Lanjut ke Lokasi →
            </Button>
        </div>
    </div>
</template>

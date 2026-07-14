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
            <h2 class="text-lg font-semibold mb-4">{{ $t('wizard.step1_title') }}</h2>
            <p class="text-sm text-muted-foreground mb-6">{{ $t('wizard.step1_subtitle') }}</p>
        </div>

        <div class="space-y-2">
            <Label for="nama">{{ $t('label.reporter_name_required') }}</Label>
            <Input id="nama" v-model="wizard.form.nama_pelapor" :placeholder="$t('label.reporter_name_placeholder')" />
        </div>

        <div class="space-y-2">
            <Label for="email">{{ $t('label.email') }}</Label>
            <Input id="email" v-model="wizard.form.email" type="email" :placeholder="$t('label.email_optional_placeholder')" />
        </div>

        <div class="space-y-2">
            <Label for="wa">{{ $t('label.whatsapp_number_required') }}</Label>
            <Input id="wa" v-model="wizard.form.nomor_wa" :placeholder="$t('label.whatsapp_placeholder')" />
            <p class="text-xs text-muted-foreground">{{ $t('label.whatsapp_format_hint') }}</p>
        </div>

        <div class="flex justify-end pt-4">
            <Button :disabled="!wizard.canProceedStep1" @click="wizard.nextStep()">
                {{ $t('button.next_location') }} →
            </Button>
        </div>
    </div>
</template>

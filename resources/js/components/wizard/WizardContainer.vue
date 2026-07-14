<script setup lang="ts">
import { useWizardStore } from '@/stores/wizardStore';
import WizardStepIndicator from './WizardStepIndicator.vue';
import Step1Identitas from './Step1Identitas.vue';
import Step2Lokasi from './Step2Lokasi.vue';
import Step3Detail from './Step3Detail.vue';
import Step4Konfirmasi from './Step4Konfirmasi.vue';

const wizard = useWizardStore();
</script>

<template>
    <div class="max-w-2xl mx-auto py-8 px-4">
        <h1 class="text-2xl font-bold text-center mb-2">{{ $t('wizard.title') }}</h1>
        <p class="text-muted-foreground text-center mb-8">{{ $t('wizard.subtitle') }}</p>

        <WizardStepIndicator />

        <div class="mt-8">
            <Step1Identitas v-if="wizard.currentStep === 1" />
            <Step2Lokasi v-else-if="wizard.currentStep === 2" />
            <Step3Detail v-else-if="wizard.currentStep === 3" />
            <Step4Konfirmasi v-else-if="wizard.currentStep === 4" />
        </div>
    </div>
</template>

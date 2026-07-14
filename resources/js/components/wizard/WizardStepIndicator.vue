<script setup lang="ts">
import { useWizardStore } from '@/stores/wizardStore';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const wizard = useWizardStore();
const { t } = useI18n();

const steps = computed(() => [
    t('wizard.step_identitas'),
    t('wizard.step_lokasi'),
    t('wizard.step_detail'),
    t('wizard.step_konfirmasi'),
]);
</script>

<template>
    <div class="flex items-center justify-center gap-2">
        <template v-for="(label, i) in steps" :key="i">
            <div class="flex items-center gap-2">
                <div
                    class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                    :class="{
                        'bg-primary text-primary-foreground': wizard.currentStep > i,
                        'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2': wizard.currentStep === i + 1,
                        'bg-muted text-muted-foreground': wizard.currentStep < i + 1,
                    }"
                >
                    {{ wizard.currentStep > i ? '✓' : i + 1 }}
                </div>
                <span
                    class="text-sm hidden sm:inline"
                    :class="{ 'text-muted-foreground': wizard.currentStep !== i + 1 }"
                >
                    {{ label }}
                </span>
            </div>
            <div v-if="i < steps.length - 1" class="w-8 h-px bg-border" />
        </template>
    </div>
</template>

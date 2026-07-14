import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface AduanForm {
    nama_pelapor: string;
    email: string;
    nomor_wa: string;
    jenis_rokok: string;
    kabupaten_kota: string;
    lokasi_kejadian: string;
    latitude: number | null;
    longitude: number | null;
    location_source: 'gps' | 'ip' | 'manual';
    nama_toko: string;
    merk_rokok: string;
    detail_aduan: string;
    foto_bukti: string | null;
}

const initialForm: AduanForm = {
    nama_pelapor: '',
    email: '',
    nomor_wa: '',
    jenis_rokok: '',
    kabupaten_kota: '',
    lokasi_kejadian: '',
    latitude: null,
    longitude: null,
    location_source: 'manual',
    nama_toko: '',
    merk_rokok: '',
    detail_aduan: '',
    foto_bukti: null,
};

export const useWizardStore = defineStore('wizard', () => {
    const currentStep = ref(1);
    const form = ref<AduanForm>({ ...initialForm });
    const isSubmitting = ref(false);

    const totalSteps = 4;

    function nextStep() {
        if (currentStep.value < totalSteps) currentStep.value++;
    }

    function prevStep() {
        if (currentStep.value > 1) currentStep.value--;
    }

    function resetForm() {
        form.value = { ...initialForm };
        currentStep.value = 1;
    }

    const canProceedStep1 = computed(() =>
        form.value.nama_pelapor.length >= 3
        && /^(08|62)\d{8,12}$/.test(form.value.nomor_wa.replace(/\D/g, ''))
    );

    const canProceedStep2 = computed(() =>
        form.value.kabupaten_kota !== ''
        && form.value.lokasi_kejadian.length >= 10
        && form.value.nama_toko.length >= 3
    );

    const canProceedStep3 = computed(() =>
        form.value.jenis_rokok !== ''
        && form.value.merk_rokok.length >= 2
        && form.value.detail_aduan.length >= 20
    );

    return {
        currentStep, form, isSubmitting, totalSteps,
        nextStep, prevStep, resetForm,
        canProceedStep1, canProceedStep2, canProceedStep3,
    };
});

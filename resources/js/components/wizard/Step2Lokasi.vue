<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useWizardStore } from '@/stores/wizardStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MapPicker from '@/components/MapPicker.vue';
import api from '@/services/api';

const wizard = useWizardStore();
const kabupatenKotaList = ref<{ kode: string; nama: string }[]>([]);

onMounted(async () => {
    try {
        const { data } = await api.get('/kabupaten-kota');
        kabupatenKotaList.value = data;
    } catch (error) {
        console.error('Failed to load kabupaten/kota', error);
    }
});

function onMapUpdate(lat: number, lng: number, source: 'gps' | 'ip' | 'manual') {
    wizard.form.latitude = lat;
    wizard.form.longitude = lng;
    wizard.form.location_source = source;
}
</script>

<template>
    <div class="space-y-6">
        <h2 class="text-lg font-semibold">{{ $t('wizard.step2_title') }}</h2>

        <div class="space-y-2">
            <Label>{{ $t('label.city_kab_required') }}</Label>
            <Select v-model="wizard.form.kabupaten_kota">
                <SelectTrigger>
                    <SelectValue :placeholder="$t('label.select_city_kab')" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem v-for="kota in kabupatenKotaList" :key="kota.kode" :value="kota.nama">
                        {{ kota.nama }}
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div class="space-y-2">
            <Label>{{ $t('wizard.choose_location_map') }}</Label>
            <MapPicker @update="onMapUpdate" />
        </div>

        <div class="space-y-2">
            <Label for="alamat">{{ $t('label.address_required') }}</Label>
            <Input id="alamat" v-model="wizard.form.lokasi_kejadian" :placeholder="$t('label.address_placeholder')" />
        </div>

        <div class="space-y-2">
            <Label for="toko">{{ $t('label.shop_required') }}</Label>
            <Input id="toko" v-model="wizard.form.nama_toko" :placeholder="$t('label.shop_placeholder')" />
        </div>

        <div class="flex justify-between pt-4">
            <Button variant="outline" @click="wizard.prevStep()">← {{ $t('button.back') }}</Button>
            <Button :disabled="!wizard.canProceedStep2" @click="wizard.nextStep()">
                {{ $t('button.next_detail') }} →
            </Button>
        </div>
    </div>
</template>

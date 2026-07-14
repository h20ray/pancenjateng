import { ref } from 'vue';

export function useGeolocation() {
    const lat = ref<number | null>(null);
    const lng = ref<number | null>(null);
    const error = ref<string>('');
    const loading = ref(false);

    async function getPosition(): Promise<{ lat: number; lng: number } | null> {
        loading.value = true;
        error.value = '';

        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                error.value = 'Geolokasi tidak didukung browser ini.';
                loading.value = false;
                resolve(null);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    lat.value = pos.coords.latitude;
                    lng.value = pos.coords.longitude;
                    loading.value = false;
                    resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                },
                () => {
                    error.value = 'Tidak dapat mengakses lokasi.';
                    loading.value = false;
                    resolve(null);
                },
                { enableHighAccuracy: true, timeout: 10000 },
            );
        });
    }

    return { lat, lng, error, loading, getPosition };
}

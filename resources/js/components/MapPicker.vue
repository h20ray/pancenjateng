<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { loadGoogleMaps } from '@/services/googleMapsLoader';
import { useGeolocation } from '@/composables/useGeolocation';
import { Button } from '@/components/ui/button';

const emit = defineEmits<{ update: [lat: number, lng: number, source: 'gps' | 'ip' | 'manual'] }>();

const mapDiv = ref<HTMLDivElement>();
const markerPosition = ref<{ lat: number; lng: number } | null>(null);
const { getPosition, loading: geoLoading } = useGeolocation();

const defaultCenter = { lat: -7.150975, lng: 110.140259 }; // Pusat Jawa Tengah

let mapInstance: google.maps.Map | null = null;
let updateMarkerFn: ((pos: google.maps.LatLng) => void) | null = null;
let marker: google.maps.Marker | null = null;
let autocomplete: google.maps.places.Autocomplete | null = null;
let clickListener: google.maps.MapsEventListener | null = null;

onMounted(async () => {
    try {
        const google = await loadGoogleMaps();

        const map = new google.maps.Map(mapDiv.value!, {
            center: defaultCenter,
            zoom: 10,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
        });
        mapInstance = map;

        updateMarkerFn = function updateMarker(pos: google.maps.LatLng) {
            markerPosition.value = { lat: pos.lat(), lng: pos.lng() };
            if (!marker) {
                const m = new google.maps.Marker({
                    map: map,
                    position: pos,
                    draggable: true,
                });
                marker = m;
                m.addListener('dragend', () => {
                    const p = m.getPosition();
                    if (p) {
                        markerPosition.value = { lat: p.lat(), lng: p.lng() };
                        emit('update', p.lat(), p.lng(), 'manual');
                    }
                });
            } else {
                marker.setPosition(pos);
            }
            map.panTo(pos);
        };

        clickListener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
                updateMarkerFn!(e.latLng);
                emit('update', e.latLng.lat(), e.latLng.lng(), 'manual');
            }
        });

        // Places Autocomplete search box
        const input = document.getElementById('map-search') as HTMLInputElement;
        if (input) {
            autocomplete = new google.maps.places.Autocomplete(input, {
                componentRestrictions: { country: 'ID' },
            });
            autocomplete!.bindTo('bounds', map);

            autocomplete!.addListener('place_changed', () => {
                const place = autocomplete!.getPlace();
                if (place.geometry?.location) {
                    const loc = place.geometry.location;
                    map.setZoom(16);
                    updateMarkerFn!(loc);
                    emit('update', loc.lat(), loc.lng(), 'manual');
                }
            });
        }
    } catch (e) {
        console.error('Google Maps failed to load', e);
    }
});

onUnmounted(() => {
    if (clickListener) google.maps.event.removeListener(clickListener);
    if (autocomplete) google.maps.event.clearInstanceListeners(autocomplete);
    if (marker) google.maps.event.clearInstanceListeners(marker);
    if (mapInstance) {
        google.maps.event.clearInstanceListeners(mapInstance);
        mapInstance = null;
    }
    updateMarkerFn = null;
    marker = null;
    autocomplete = null;
    clickListener = null;
});

async function useMyLocation() {
    const pos = await getPosition();
    if (pos && typeof google !== 'undefined' && updateMarkerFn && mapInstance) {
        const latLng = new google.maps.LatLng(pos.lat, pos.lng);
        updateMarkerFn(latLng);
        mapInstance.setZoom(16);
        emit('update', pos.lat, pos.lng, 'gps');
    }
}
</script>

<template>
    <div class="space-y-2">
        <div class="flex gap-2">
            <input
                id="map-search"
                type="text"
                :placeholder="$t('wizard.search_address_placeholder')"
                class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            />
            <Button variant="outline" size="sm" type="button" :disabled="geoLoading" @click="useMyLocation">
                {{ geoLoading ? '...' : '📍 ' + $t('button.use_my_location') }}
            </Button>
        </div>
        <div ref="mapDiv" class="w-full h-[300px] rounded-md border" />
    </div>
</template>

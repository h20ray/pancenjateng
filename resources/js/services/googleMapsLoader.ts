import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

let googleMapsPromise: Promise<any> | null = null;

export async function loadGoogleMaps(): Promise<any> {
    if (!googleMapsPromise) {
        setOptions({
            apiKey: (import.meta.env.VITE_GOOGLE_MAP_KEY as string) || '',
            version: 'weekly',
        } as any);

        googleMapsPromise = Promise.all([
            importLibrary('maps'),
            importLibrary('places'),
            importLibrary('marker'),
        ]).then(() => (window as any).google);
    }

    return googleMapsPromise;
}

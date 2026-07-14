<?php

namespace App\Services;

use App\Models\Aduan;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsappService
{
    public function sendRecap(Aduan $aduan): void
    {
        $url = config('services.whatsapp.url');
        $token = config('services.whatsapp.token');
        $target = config('services.whatsapp.target');

        if (! $url || ! $token) {
            Log::warning('WhatsApp gateway not configured');
            $aduan->update(['whatsapp_status' => 'pending']);

            return;
        }

        $message = $this->buildRecapMessage($aduan);

        try {
            $response = Http::withToken($token)
                ->post($url, [
                    'target' => $target,
                    'message' => $message,
                ]);

            $aduan->update([
                'whatsapp_sent_at' => now(),
                'whatsapp_status' => $response->successful() ? 'sent' : 'failed',
            ]);
        } catch (\Exception $e) {
            Log::error('WhatsApp send failed: '.$e->getMessage());
            $aduan->update(['whatsapp_status' => 'failed']);
        }
    }

    private function buildRecapMessage(Aduan $aduan): string
    {
        $maps = $aduan->latitude && $aduan->longitude
            ? "https://maps.google.com/?q={$aduan->latitude},{$aduan->longitude}"
            : '(tidak tersedia)';

        $foto = $aduan->foto_bukti ? '📸 Ada foto bukti' : '📸 Tanpa foto';

        return "📢 *ADUAN BARU - Pancen Jateng*\n"
            ."🎫 Tiket: {$aduan->ticket_number}\n"
            .'📅 '.$aduan->created_at->format('d F Y, H:i')." WIB\n\n"
            ."👤 *Pelapor*\n"
            ."Nama: {$aduan->nama_pelapor}\n"
            ."WA: {$aduan->nomor_wa}\n\n"
            ."📍 *Lokasi*\n"
            ."Kab/Kota: {$aduan->kabupaten_kota}\n"
            ."Alamat: {$aduan->lokasi_kejadian}\n"
            ."Toko: {$aduan->nama_toko}\n"
            ."🗺 {$maps}\n\n"
            ."🚬 *Rokok*\n"
            ."Jenis: {$aduan->jenis_rokok}\n"
            ."Merk: {$aduan->merk_rokok}\n\n"
            ."📝 *Detail*\n"
            ."{$aduan->detail_aduan}\n\n"
            ."{$foto}\n"
            ."🔍 Lacak: https://pancenjateng.id/lacak?tiket={$aduan->ticket_number}";
    }
}

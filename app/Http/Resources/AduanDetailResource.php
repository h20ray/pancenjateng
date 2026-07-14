<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AduanDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ticket_number' => $this->ticket_number,
            'nama_pelapor' => $this->nama_pelapor,
            'email' => $this->email,
            'nomor_wa' => $this->nomor_wa,
            'jenis_rokok' => $this->jenis_rokok,
            'kabupaten_kota' => $this->kabupaten_kota,
            'lokasi_kejadian' => $this->lokasi_kejadian,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'location_source' => $this->location_source,
            'nama_toko' => $this->nama_toko,
            'merk_rokok' => $this->merk_rokok,
            'detail_aduan' => $this->detail_aduan,
            'foto_bukti' => $this->foto_bukti ? asset('storage/'.$this->foto_bukti) : null,
            'status' => $this->status,
            'catatan_admin' => $this->catatan_admin,
            'whatsapp_sent_at' => $this->whatsapp_sent_at ? $this->whatsapp_sent_at->toIso8601String() : null,
            'whatsapp_status' => $this->whatsapp_status,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}

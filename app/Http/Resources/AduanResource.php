<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AduanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ticket_number' => $this->ticket_number,
            'nama_pelapor' => $this->nama_pelapor,
            'nomor_wa' => $this->nomor_wa,
            'jenis_rokok' => $this->jenis_rokok,
            'kabupaten_kota' => $this->kabupaten_kota,
            'status' => $this->status,
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}

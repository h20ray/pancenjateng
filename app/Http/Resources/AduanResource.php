<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AduanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'ticket_number' => $this->ticket_number,
            'status' => $this->status,
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}

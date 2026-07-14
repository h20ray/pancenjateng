<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Aduan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrackController extends Controller
{
    public function track(Request $request): JsonResponse
    {
        $request->validate([
            'ticket' => ['required', 'string'],
            'phone' => ['required', 'string'],
        ]);

        $phone = preg_replace('/\D/', '', $request->phone);
        if (str_starts_with($phone, '08')) {
            $phone = '628'.substr($phone, 2);
        }

        $aduan = Aduan::where('ticket_number', $request->ticket)
            ->where('nomor_wa', $phone)
            ->first();

        if (! $aduan) {
            return response()->json(['message' => 'Laporan tidak ditemukan.'], 404);
        }

        return response()->json([
            'ticket_number' => $aduan->ticket_number,
            'status' => $aduan->status,
            'kabupaten_kota' => $aduan->kabupaten_kota,
            'jenis_rokok' => $aduan->jenis_rokok,
            'created_at' => $aduan->created_at->toIso8601String(),
            'updated_at' => $aduan->updated_at->toIso8601String(),
        ]);
    }
}

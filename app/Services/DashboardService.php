<?php

namespace App\Services;

use App\Models\Aduan;
use Carbon\Carbon;

class DashboardService
{
    public function stats(): array
    {
        $perStatusRaw = Aduan::selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        $perStatus = [
            'baru' => $perStatusRaw['baru'] ?? 0,
            'diproses' => $perStatusRaw['diproses'] ?? 0,
            'selesai' => $perStatusRaw['selesai'] ?? 0,
            'ditolak' => $perStatusRaw['ditolak'] ?? 0,
        ];

        return [
            'total' => Aduan::count(),
            'hari_ini' => Aduan::whereDate('created_at', today())->count(),
            'minggu_ini' => Aduan::where('created_at', '>=', Carbon::now()->startOfWeek())->count(),
            'bulan_ini' => Aduan::where('created_at', '>=', Carbon::now()->startOfMonth())->count(),
            'per_status' => $perStatus,
            'per_kabupaten' => Aduan::selectRaw('kabupaten_kota, count(*) as total')
                ->groupBy('kabupaten_kota')
                ->orderByDesc('total')
                ->limit(15)
                ->pluck('total', 'kabupaten_kota'),
            'terbaru' => Aduan::orderByDesc('created_at')->limit(10)->get(),
        ];
    }
}

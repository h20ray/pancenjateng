<?php

namespace App\Services;

use App\Http\Requests\AduanStoreRequest;
use App\Models\Aduan;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AduanService
{
    public function store(AduanStoreRequest $request): Aduan
    {
        return DB::transaction(function () use ($request) {
            return Aduan::create([
                ...$request->validated(),
                'ticket_number' => $this->generateTicketNumber(),
                'status' => 'baru',
            ]);
        });
    }

    public function generateTicketNumber(): string
    {
        $date = Carbon::now()->format('Ymd');
        $last = Aduan::whereDate('created_at', today())
            ->orderByDesc('id')
            ->lockForUpdate()
            ->first();

        $next = $last ? (int) substr($last->ticket_number, -4) + 1 : 1;

        return sprintf('ADN-%s-%04d', $date, $next);
    }

    public function findDuplicate(string $nomorWa, string $namaToko): bool
    {
        return Aduan::where('nomor_wa', $nomorWa)
            ->where('nama_toko', $namaToko)
            ->where('created_at', '>=', Carbon::now()->subMinutes(5))
            ->exists();
    }
}

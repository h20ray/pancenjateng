<?php

namespace App\Services;

use App\Http\Requests\AduanStoreRequest;
use App\Models\Aduan;
use Carbon\Carbon;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;

use function abort;

class AduanService
{
    public function store(AduanStoreRequest $request): Aduan
    {
        $phone = $this->normalizePhone($request->nomor_wa);
        $maxRetries = 3;

        for ($attempt = 0; $attempt < $maxRetries; $attempt++) {
            try {
                return DB::transaction(function () use ($request, $phone) {
                    if ($this->findDuplicateUnsafe($phone, $request->nama_toko)) {
                        abort(409, 'Laporan serupa sudah dikirim dalam 5 menit terakhir.');
                    }

                    return Aduan::create([
                        ...$request->validated(),
                        'nomor_wa' => $phone,
                        'ticket_number' => $this->generateTicketNumber(),
                        'status' => 'baru',
                    ]);
                });
            } catch (UniqueConstraintViolationException $e) {
                if ($attempt === $maxRetries - 1) {
                    throw $e;
                }
                // Ticket number collision — retry with a new sequence number
            }
        }
    }

    public function normalizePhone(string $phone): string
    {
        $phone = preg_replace('/\D/', '', $phone);
        if (str_starts_with($phone, '08')) {
            $phone = '628'.substr($phone, 2);
        }

        return $phone;
    }

    public function findDuplicate(string $nomorWa, string $namaToko): bool
    {
        $phone = $this->normalizePhone($nomorWa);

        return $this->findDuplicateUnsafe($phone, $namaToko);
    }

    private function findDuplicateUnsafe(string $normalizedPhone, string $namaToko): bool
    {
        return Aduan::where('nomor_wa', $normalizedPhone)
            ->where('nama_toko', $namaToko)
            ->where('created_at', '>=', Carbon::now()->subMinutes(5))
            ->exists();
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
}

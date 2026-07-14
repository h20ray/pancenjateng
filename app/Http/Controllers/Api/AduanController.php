<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AduanStoreRequest;
use App\Http\Resources\AduanResource;
use App\Services\AduanService;
use App\Services\WhatsappService;
use Illuminate\Http\JsonResponse;

class AduanController extends Controller
{
    public function __construct(
        private AduanService $aduanService,
        private WhatsappService $whatsappService,
    ) {}

    public function store(AduanStoreRequest $request): JsonResponse
    {
        if ($this->aduanService->findDuplicate($request->nomor_wa, $request->nama_toko)) {
            return response()->json([
                'message' => 'Laporan serupa sudah dikirim dalam 5 menit terakhir.',
            ], 409);
        }

        $aduan = $this->aduanService->store($request);

        $this->whatsappService->sendRecap($aduan);

        return (new AduanResource($aduan))
            ->response()
            ->setStatusCode(201);
    }
}

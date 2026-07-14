<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSettingsRequest;
use App\Services\SettingService;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    public function __construct(private SettingService $settingService) {}

    public function index(): JsonResponse
    {
        return response()->json($this->settingService->all());
    }

    public function update(UpdateSettingsRequest $request): JsonResponse
    {
        try {
            $this->settingService->update($request->validated());

            return response()->json(['message' => 'Pengaturan berhasil disimpan.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal menyimpan pengaturan.'], 500);
        }
    }
}

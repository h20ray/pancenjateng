<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'foto' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        try {
            $path = $request->file('foto')->store('temp', 'public');

            return response()->json(['path' => $path], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengunggah file.'], 500);
        }
    }
}

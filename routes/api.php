<?php

use App\Http\Controllers\Admin\AduanController as AdminAduanController;
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Api\AduanController;
use App\Http\Controllers\Api\KabupatenKotaController;
use App\Http\Controllers\Api\TrackController;
use App\Http\Controllers\Api\UploadController;
use Illuminate\Support\Facades\Route;

// Public endpoints
Route::post('/aduan', [AduanController::class, 'store']);
Route::get('/aduan/track', [TrackController::class, 'track']);
Route::post('/aduan/upload', [UploadController::class, 'upload']);
Route::get('/kabupaten-kota', [KabupatenKotaController::class, 'index']);

// Admin Login
Route::post('/admin/login', [AuthController::class, 'login']);

// Admin Protected Endpoints
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/aduan', [AdminAduanController::class, 'index']);
    Route::get('/aduan/export', [AdminAduanController::class, 'export']);
    Route::get('/aduan/{aduan}', [AdminAduanController::class, 'show']);
    Route::patch('/aduan/{aduan}', [AdminAduanController::class, 'updateStatus']);
    Route::delete('/aduan/{aduan}', [AdminAduanController::class, 'destroy']);
    Route::post('/aduan/{aduan}/resend-wa', [AdminAduanController::class, 'resendWhatsapp']);
    Route::get('/settings', [SettingController::class, 'index']);
    Route::put('/settings', [SettingController::class, 'update']);
});

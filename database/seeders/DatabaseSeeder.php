<?php

namespace Database\Seeders;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'andoru.ray@gmail.com'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('+Codina14'),
            ],
        );

        Setting::upsert([
            ['key' => 'app_name', 'value' => 'Pancen Jateng'],
            ['key' => 'app_description', 'value' => 'Sistem Pengaduan Rokok Ilegal Provinsi Jawa Tengah'],
            ['key' => 'organization_name', 'value' => 'Satpol PP Provinsi Jawa Tengah'],
            ['key' => 'organization_address', 'value' => null],
            ['key' => 'organization_phone', 'value' => null],
            ['key' => 'organization_email', 'value' => null],
            ['key' => 'default_whatsapp_target', 'value' => null],
        ], ['key'], ['value']);
    }
}

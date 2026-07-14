<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminSettingsApiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::create([
            'name' => 'Admin Jateng',
            'email' => 'admin@pancenjateng.id',
            'password' => bcrypt('password123'),
        ]);

        Setting::insert([
            ['key' => 'app_name', 'value' => 'Pancen Jateng'],
            ['key' => 'app_description', 'value' => 'Sistem Pengaduan'],
            ['key' => 'organization_name', 'value' => 'Satpol PP'],
            ['key' => 'organization_address', 'value' => null],
            ['key' => 'organization_phone', 'value' => null],
            ['key' => 'organization_email', 'value' => null],
            ['key' => 'default_whatsapp_target', 'value' => null],
        ]);
    }

    public function test_admin_can_fetch_settings()
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/settings');

        $response->assertStatus(200)
            ->assertJsonFragment(['app_name' => 'Pancen Jateng'])
            ->assertJsonFragment(['organization_name' => 'Satpol PP']);
    }

    public function test_unauthenticated_cannot_access_settings()
    {
        $response = $this->getJson('/api/admin/settings');
        $response->assertStatus(401);
    }

    public function test_admin_can_update_settings()
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson('/api/admin/settings', [
                'app_name' => 'Nama Baru',
                'app_description' => 'Deskripsi Baru',
            ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Pengaturan berhasil disimpan.']);

        $this->assertDatabaseHas('settings', ['key' => 'app_name', 'value' => 'Nama Baru']);
        $this->assertDatabaseHas('settings', ['key' => 'app_description', 'value' => 'Deskripsi Baru']);
    }

    public function test_settings_update_validates_fields()
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson('/api/admin/settings', [
                'organization_email' => 'not-an-email',
                'app_name' => str_repeat('x', 256),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['organization_email', 'app_name']);
    }

    public function test_settings_update_allows_partial_update()
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson('/api/admin/settings', [
                'app_name' => 'Only Name Updated',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('settings', ['key' => 'app_name', 'value' => 'Only Name Updated']);
        // Other keys should remain unchanged
        $this->assertDatabaseHas('settings', ['key' => 'organization_name', 'value' => 'Satpol PP']);
    }
}

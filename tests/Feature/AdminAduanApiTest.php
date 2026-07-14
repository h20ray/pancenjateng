<?php

namespace Tests\Feature;

use App\Models\Aduan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAduanApiTest extends TestCase
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
    }

    public function test_admin_can_login()
    {
        $response = $this->postJson('/api/admin/login', [
            'email' => 'admin@pancenjateng.id',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['token', 'user' => ['name', 'email']]);
    }

    public function test_unauthenticated_cannot_access_admin_routes()
    {
        $response = $this->getJson('/api/admin/dashboard');
        $response->assertStatus(401);
    }

    public function test_admin_can_list_aduans()
    {
        Aduan::create([
            'ticket_number' => 'ADN-20260714-0001',
            'nama_pelapor' => 'Budi',
            'nomor_wa' => '6281234567890',
            'jenis_rokok' => 'sigaret_mesin',
            'kabupaten_kota' => 'Semarang',
            'lokasi_kejadian' => 'Jl. Pemuda No. 123',
            'nama_toko' => 'Toko Makmur',
            'merk_rokok' => 'Gudang Garam',
            'detail_aduan' => 'Menjual rokok tanpa pita cukai.',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/aduan');

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'current_page', 'total']);
    }

    public function test_admin_can_update_aduan_status()
    {
        $aduan = Aduan::create([
            'ticket_number' => 'ADN-20260714-0001',
            'nama_pelapor' => 'Budi',
            'nomor_wa' => '6281234567890',
            'jenis_rokok' => 'sigaret_mesin',
            'kabupaten_kota' => 'Semarang',
            'lokasi_kejadian' => 'Jl. Pemuda No. 123',
            'nama_toko' => 'Toko Makmur',
            'merk_rokok' => 'Gudang Garam',
            'detail_aduan' => 'Menjual rokok tanpa pita cukai.',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/admin/aduan/{$aduan->id}", [
                'status' => 'diproses',
                'catatan_admin' => 'Telah dihubungi kepolisian daerah.',
            ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['status' => 'diproses', 'catatan_admin' => 'Telah dihubungi kepolisian daerah.']);

        $this->assertEquals('diproses', $aduan->fresh()->status);
    }

    public function test_admin_can_soft_delete_aduan()
    {
        $aduan = Aduan::create([
            'ticket_number' => 'ADN-20260714-0001',
            'nama_pelapor' => 'Budi',
            'nomor_wa' => '6281234567890',
            'jenis_rokok' => 'sigaret_mesin',
            'kabupaten_kota' => 'Semarang',
            'lokasi_kejadian' => 'Jl. Pemuda No. 123',
            'nama_toko' => 'Toko Makmur',
            'merk_rokok' => 'Gudang Garam',
            'detail_aduan' => 'Menjual rokok tanpa pita cukai.',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/admin/aduan/{$aduan->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted($aduan);
    }
}

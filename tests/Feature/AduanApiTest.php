<?php

namespace Tests\Feature;

use App\Models\Aduan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AduanApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_submit_a_valid_aduan()
    {
        Http::fake([
            'https://api.fonnte.com/send' => Http::response(['status' => true], 200),
        ]);

        config([
            'services.whatsapp.url' => 'https://api.fonnte.com/send',
            'services.whatsapp.token' => 'dummy-token',
            'services.whatsapp.target' => '62812xxxxxx',
        ]);

        $response = $this->postJson('/api/aduan', [
            'nama_pelapor' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'nomor_wa' => '6281234567890',
            'jenis_rokok' => 'sigaret_mesin',
            'kabupaten_kota' => 'Semarang',
            'lokasi_kejadian' => 'Jl. Pemuda No. 123, Kelurahan Sekayu',
            'latitude' => -7.005,
            'longitude' => 110.435,
            'location_source' => 'gps',
            'nama_toko' => 'Toko Makmur',
            'merk_rokok' => 'Gudang Garam',
            'detail_aduan' => 'Menjual rokok tanpa pita cukai dengan harga murah.',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['ticket_number', 'status', 'created_at']);

        Http::assertSent(function ($request) {
            return $request->url() === 'https://api.fonnte.com/send' &&
                $request->hasHeader('Authorization', 'Bearer dummy-token') &&
                $request['target'] === '62812xxxxxx' &&
                str_contains($request['message'], 'ADUAN BARU - Pancen Jateng');
        });

        // Assert whatsapp status was updated in the database
        $this->assertDatabaseHas('aduans', [
            'ticket_number' => $response->json('ticket_number'),
            'whatsapp_status' => 'sent',
        ]);
    }

    public function test_validation_fails_with_invalid_data()
    {
        $response = $this->postJson('/api/aduan', [
            'nama_pelapor' => 'A',
            'nomor_wa' => '123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['nama_pelapor', 'nomor_wa', 'jenis_rokok', 'kabupaten_kota', 'lokasi_kejadian', 'nama_toko', 'merk_rokok', 'detail_aduan']);
    }

    public function test_duplicate_submission_within_5_minutes_returns_409()
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

        $response = $this->postJson('/api/aduan', [
            'nama_pelapor' => 'Budi Santoso',
            'nomor_wa' => '6281234567890',
            'jenis_rokok' => 'sigaret_mesin',
            'kabupaten_kota' => 'Semarang',
            'lokasi_kejadian' => 'Jl. Pemuda No. 123',
            'nama_toko' => 'Toko Makmur',
            'merk_rokok' => 'Gudang Garam',
            'detail_aduan' => 'Menjual rokok tanpa pita cukai dengan harga murah.',
        ]);

        $response->assertStatus(409);
    }

    public function test_can_track_aduan_by_ticket_and_phone()
    {
        $aduan = Aduan::create([
            'ticket_number' => 'ADN-20260714-0002',
            'nama_pelapor' => 'Ani',
            'nomor_wa' => '6289876543210',
            'jenis_rokok' => 'sigaret_tangan',
            'kabupaten_kota' => 'Solo',
            'lokasi_kejadian' => 'Pasar Gede, Solo',
            'nama_toko' => 'Toko Murah',
            'merk_rokok' => 'Djarum',
            'detail_aduan' => 'Rokok tanpa cukai dijual bebas.',
        ]);

        $response = $this->getJson('/api/aduan/track?ticket=ADN-20260714-0002&phone=6289876543210');

        $response->assertStatus(200)
            ->assertJsonFragment(['status' => 'baru']);
    }

    public function test_track_returns_404_for_wrong_credentials()
    {
        $response = $this->getJson('/api/aduan/track?ticket=WRONG&phone=000');

        $response->assertStatus(404);
    }
}

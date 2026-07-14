<?php

namespace Database\Factories;

use App\Models\Aduan;
use Illuminate\Database\Eloquent\Factories\Factory;

class AduanFactory extends Factory
{
    protected $model = Aduan::class;

    public function definition(): array
    {
        $kabupatenKota = [
            'Semarang', 'Kota Semarang', 'Solo', 'Kota Surakarta',
            'Magelang', 'Pati', 'Jepara', 'Kudus', 'Demak',
            'Boyolali', 'Klaten', 'Karanganyar', 'Sragen',
        ];

        $jenisRokok = ['sigaret_mesin', 'sigaret_tangan', 'tembakau_iris', 'cerutu', 'lainnya'];

        return [
            'ticket_number' => 'ADN-'.now()->format('Ymd').'-'.str_pad((string) fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'nama_pelapor' => fake()->name(),
            'email' => fake()->optional()->safeEmail(),
            'nomor_wa' => '628'.fake()->numerify('##########'),
            'jenis_rokok' => fake()->randomElement($jenisRokok),
            'kabupaten_kota' => fake()->randomElement($kabupatenKota),
            'lokasi_kejadian' => fake()->streetAddress().', '.fake()->city(),
            'latitude' => fake()->optional()->randomFloat(7, -8.0, -6.5),
            'longitude' => fake()->optional()->randomFloat(7, 109.0, 111.5),
            'location_source' => fake()->randomElement(['gps', 'ip', 'manual']),
            'nama_toko' => 'Toko '.fake()->company(),
            'merk_rokok' => fake()->randomElement(['Gudang Garam', 'Djarum', 'Sampoerna', 'Marlboro', 'Dunhill']),
            'detail_aduan' => fake()->paragraph(3),
            'foto_bukti' => fake()->optional()->uuid().'.jpg',
            'status' => fake()->randomElement(['baru', 'diproses', 'selesai', 'ditolak']),
        ];
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aduans', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number', 20)->unique();
            $table->string('nama_pelapor', 100);
            $table->string('email', 100)->nullable();
            $table->string('nomor_wa', 20);
            $table->enum('jenis_rokok', ['sigaret_mesin', 'sigaret_tangan', 'tembakau_iris', 'cerutu', 'lainnya']);
            $table->string('kabupaten_kota', 50);
            $table->text('lokasi_kejadian');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->enum('location_source', ['gps', 'ip', 'manual'])->default('manual');
            $table->string('nama_toko', 150);
            $table->string('merk_rokok', 150);
            $table->text('detail_aduan');
            $table->string('foto_bukti', 255)->nullable();
            $table->enum('status', ['baru', 'diproses', 'selesai', 'ditolak'])->default('baru');
            $table->text('catatan_admin')->nullable();
            $table->timestamp('whatsapp_sent_at')->nullable();
            $table->string('whatsapp_status', 50)->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['ticket_number', 'nomor_wa']);
            $table->index('status');
            $table->index('kabupaten_kota');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aduans');
    }
};

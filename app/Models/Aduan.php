<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Aduan extends Model
{
    use SoftDeletes;

    protected $table = 'aduans';

    protected $fillable = [
        'ticket_number',
        'nama_pelapor',
        'email',
        'nomor_wa',
        'jenis_rokok',
        'kabupaten_kota',
        'lokasi_kejadian',
        'latitude',
        'longitude',
        'location_source',
        'nama_toko',
        'merk_rokok',
        'detail_aduan',
        'foto_bukti',
        'status',
        'catatan_admin',
        'whatsapp_sent_at',
        'whatsapp_status',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'whatsapp_sent_at' => 'datetime',
    ];
}

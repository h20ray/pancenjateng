<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AduanStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_pelapor' => ['required', 'string', 'min:3', 'max:100'],
            'email' => ['nullable', 'email', 'max:100'],
            'nomor_wa' => ['required', 'string', 'regex:/^(08|62)\d{8,12}$/'],
            'jenis_rokok' => ['required', 'in:sigaret_mesin,sigaret_tangan,tembakau_iris,cerutu,lainnya'],
            'kabupaten_kota' => ['required', 'string', 'max:50'],
            'lokasi_kejadian' => ['required', 'string', 'min:10'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'location_source' => ['nullable', 'in:gps,ip,manual'],
            'nama_toko' => ['required', 'string', 'min:3', 'max:150'],
            'merk_rokok' => ['required', 'string', 'min:2', 'max:150'],
            'detail_aduan' => ['required', 'string', 'min:20'],
            'foto_bukti' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'nomor_wa.regex' => 'Nomor WA harus dimulai dengan 08 atau 62.',
            'detail_aduan.min' => 'Detail aduan minimal 20 karakter.',
            'lokasi_kejadian.min' => 'Lokasi kejadian minimal 10 karakter.',
        ];
    }
}

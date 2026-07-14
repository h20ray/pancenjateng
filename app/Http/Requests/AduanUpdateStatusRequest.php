<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AduanUpdateStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:baru,diproses,selesai,ditolak'],
            'catatan_admin' => ['nullable', 'string'],
        ];
    }
}

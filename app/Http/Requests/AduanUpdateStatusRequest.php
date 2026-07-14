<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AduanUpdateStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:baru,diproses,selesai,ditolak'],
            'catatan_admin' => ['nullable', 'string'],
        ];
    }
}

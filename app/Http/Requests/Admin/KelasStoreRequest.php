<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class KelasStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'name'         => ['required', 'string', 'max:100', 'unique:kelas,name'],
            'jurusan_id'   => ['required', 'numeric', 'exists:jurusans,id'],
            'tingkat'      => ['required', 'string', 'in:X,XI,XII'],
            'tahun_ajaran' => ['required', 'string', 'max:9', 'regex:/^\d{4}\/\d{4}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'jurusan_id.required' => 'Jurusan wajib dipilih.',
            'jurusan_id.exists'   => 'Jurusan yang dipilih tidak valid.',
            'tahun_ajaran.regex'  => 'Format tahun ajaran harus: 2024/2025',
        ];
    }
}
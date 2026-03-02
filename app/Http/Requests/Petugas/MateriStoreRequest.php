<?php

namespace App\Http\Requests\Petugas;

use Illuminate\Foundation\Http\FormRequest;

class MateriStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['admin', 'guru'], true);
    }


    public function rules(): array
    {
        $user = $this->user();
        $isGuru = $user?->role === 'guru';

        $base = [
            'title' => ['required', 'string', 'max:255'],
            'praktik_text' => ['nullable', 'string'],
            'pdf' => ['required', 'file', 'mimes:pdf', 'max:10240'], // 10MB contoh
        ];

        if ($isGuru) {
            return $base;
        }

        // admin: wajib pilih kelas/mapel
        return array_merge($base, [
            'kelas_id' => ['required', 'exists:kelas,id'],
            'mapel_id' => ['required', 'exists:mapels,id'],
        ]);
    }
}
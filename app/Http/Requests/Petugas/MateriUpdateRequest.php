<?php

namespace App\Http\Requests\Petugas;

use Illuminate\Foundation\Http\FormRequest;

class MateriUpdateRequest extends FormRequest
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
            'title' => ['sometimes', 'string', 'max:255'],
            'praktik_text' => ['sometimes', 'nullable', 'string'],
            'pdf' => ['sometimes', 'file', 'mimes:pdf', 'max:10240'],
        ];

        if ($isGuru) {
            return $base;
        }

        return array_merge($base, [
            'kelas_id' => ['sometimes', 'exists:kelas,id'],
            'mapel_id' => ['sometimes', 'exists:mapels,id'],
        ]);
    }
}
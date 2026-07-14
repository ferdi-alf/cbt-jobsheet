<?php

namespace App\Http\Requests\Petugas;

use Illuminate\Foundation\Http\FormRequest;

class PracticeRuleStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        $u = $this->user();
        return $u && in_array($u->role, ['admin', 'guru'], true);
    }

    public function rules(): array
    {
        return [
            'materi_id' => ['required', 'integer', 'exists:materis,id'],
            'title' => ['required', 'string', 'max:255'],
            'deadline_at' => ['nullable', 'date'],

            'checklists' => ['required', 'array', 'min:1'],
            'checklists.*.title'       => ['required', 'string', 'max:255'],
            'checklists.*.standar'     => ['nullable', 'string', 'max:255'],
            'checklists.*.keterangan'  => ['nullable', 'string'],

            // Alat & Bahan (opsional) — didefinisikan guru, diisi siswa
            'tools'          => ['nullable', 'array'],
            'tools.*.kind'   => ['required', 'in:alat,bahan'],
            'tools.*.label'  => ['required', 'string', 'max:255'],
        ];
    }
}
<?php

namespace App\Http\Requests\Petugas;

use Illuminate\Foundation\Http\FormRequest;

class PracticeGradeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['admin', 'guru'], true);
    }

    public function rules(): array
    {
        return [
            'feedback'              => ['nullable', 'string'],

            // 3 komponen nilai (manual, 0-100)
            'score_alat_bahan'      => ['required', 'integer', 'min:0', 'max:100'],
            'score_sop_k3l'         => ['required', 'integer', 'min:0', 'max:100'],
            'score_praktik'         => ['required', 'integer', 'min:0', 'max:100'],

            // Catatan per-checklist (opsional)
            'notes'                 => ['nullable', 'array'],
            'notes.*.checklist_id'  => ['required', 'integer', 'exists:practice_checklists,id'],
            'notes.*.note'          => ['nullable', 'string'],
            'notes.*.score'         => ['nullable', 'integer', 'min:0', 'max:100'],
        ];
    }
}
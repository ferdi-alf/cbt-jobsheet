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
            'total_score' => ['required', 'integer', 'min:0', 'max:100'],
            'feedback' => ['nullable', 'string'],
            'notes' => ['nullable', 'array'],
            'notes.*.checklist_id' => ['required', 'integer', 'exists:practice_checklists,id'],
            'notes.*.note' => ['nullable', 'string'],
        ];
    }
}
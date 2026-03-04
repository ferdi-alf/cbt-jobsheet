<?php

namespace App\Http\Requests\Petugas;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TestStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['admin', 'guru'], true);
    }

    public function rules(): array
    {
        return [
            'materi_id' => ['required', 'exists:materis,id'],
            'type' => ['required', Rule::in(['pretest', 'posttest'])],
            'title' => ['required', 'string', 'max:255'],
            'duration_minutes' => ['required', Rule::in([30,60,90,120])],
            'start_at' => ['nullable', 'date'],
            'end_at' => ['nullable', 'date', 'after_or_equal:start_at'],
            'is_score_visible' => ['required', 'boolean'],

            // ✅ bulk questions
            'questions' => ['required', 'array', 'min:1'],
            'questions.*.question' => ['required', 'string'],
            'questions.*.option_a' => ['required', 'string'],
            'questions.*.option_b' => ['required', 'string'],
            'questions.*.option_c' => ['required', 'string'],
            'questions.*.option_d' => ['required', 'string'],
            'questions.*.option_e' => ['required', 'string'],
            'questions.*.correct_option' => ['required', Rule::in(['a','b','c','d','e'])],
        ];
    }
}
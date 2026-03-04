<?php

namespace App\Http\Requests\Petugas;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TestUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['admin', 'guru'], true);
    }

    public function rules(): array
    {
        return [
            'materi_id' => ['sometimes', 'exists:materis,id'],
            'type' => ['sometimes', Rule::in(['pretest', 'posttest'])],
            'title' => ['sometimes', 'string', 'max:255'],
            'duration_minutes' => ['sometimes', Rule::in([30,60,90,120])],
            'start_at' => ['nullable', 'date'],
            'end_at' => ['nullable', 'date', 'after_or_equal:start_at'],
            'is_score_visible' => ['sometimes', 'boolean'],

            'questions' => ['sometimes', 'array', 'min:1'],
            'questions.*.question' => ['required_with:questions', 'string'],
            'questions.*.option_a' => ['required_with:questions', 'string'],
            'questions.*.option_b' => ['required_with:questions', 'string'],
            'questions.*.option_c' => ['required_with:questions', 'string'],
            'questions.*.option_d' => ['required_with:questions', 'string'],
            'questions.*.option_e' => ['required_with:questions', 'string'],
            'questions.*.correct_option' => ['required_with:questions', Rule::in(['a','b','c','d','e'])],
        ];
    }
}
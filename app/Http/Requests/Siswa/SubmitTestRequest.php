<?php

namespace App\Http\Requests\Siswa;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SubmitTestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'siswa';
    }

    public function rules(): array
    {
        return [
            'answers' => ['nullable', 'array'],
            'answers.*.question_id' => ['required_with:answers', 'integer'],
            'answers.*.selected_option' => ['nullable', Rule::in(['A', 'B', 'C', 'D', 'E'])],
        ];
    }
}
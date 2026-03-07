<?php

namespace App\Http\Requests\Siswa;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveTestAnswerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'siswa';
    }

    public function rules(): array
    {
        return [
            'question_id' => ['required', 'integer'],
            'selected_option' => ['required', Rule::in(['A', 'B', 'C', 'D', 'E'])],
        ];
    }
}
<?php

namespace App\Http\Requests\Petugas;

use Illuminate\Foundation\Http\FormRequest;

class PracticeRuleUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $u = $this->user();
        return $u && in_array($u->role, ['admin', 'guru'], true);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'materi_id' => ['sometimes', 'integer', 'exists:materis,id'],
            'title' => ['sometimes', 'string', 'max:255'],
            'deadline_at' => ['sometimes', 'nullable', 'date'],
            'checklists' => ['sometimes', 'array', 'min:1'],
            'checklists.*.title' => ['required_with:checklists', 'string', 'max:255'],
        ];
    }
}

<?php

namespace App\Http\Requests\Siswa;

use Illuminate\Foundation\Http\FormRequest;

class PracticePhotoUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'siswa';
    }

    public function rules(): array
    {
        return [
            'checklist_id' => ['required', 'integer', 'exists:practice_checklists,id'],
            'photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:6144'],
        ];
    }
}
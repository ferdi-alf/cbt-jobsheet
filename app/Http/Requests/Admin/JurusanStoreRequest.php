<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class JurusanStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100', 'unique:jurusans,name'],
            'logo'  => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'], // 2 MB
        ];
    }

    public function messages(): array
    {
        return [
            'logo.mimes' => 'Logo harus berformat JPG atau PNG.',
            'logo.max'   => 'Ukuran logo maksimal 2 MB.',
        ];
    }
}
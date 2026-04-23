<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class KelasUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $kelasId = $this->route('kelas')?->id;

        Log::info("Kelas ID for validation: " . ($kelasId ?? 'null'));

        return [
            'name' => [
                'required',
                Rule::unique('kelas', 'name')->ignore($kelasId)
            ]
        ];
    }
}

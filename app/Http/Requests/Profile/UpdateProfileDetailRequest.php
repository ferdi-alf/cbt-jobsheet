<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UpdateProfileDetailRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::check();
    }

    public function rules(): array
    {
        $user = $this->user();

        if ($user->isGuru()) {
            return [
                'full_name' => ['required', 'string', 'max:150'],
                'nip' => ['nullable', 'string', 'max:50'],
                'gender' => ['nullable', Rule::in(['L', 'P'])],
                'phone' => ['nullable', 'string', 'max:30'],
                'kelas_id' => ['nullable', 'integer', 'exists:kelas,id'],
                'mapel_id' => ['nullable', 'integer', 'exists:mapels,id'],
            ];
        }

        if ($user->isSiswa()) {
            return [
                'full_name' => ['required', 'string', 'max:150'],
                'phone' => ['nullable', 'string', 'max:30'],
            ];
        }

        return [];
    }

    protected function passedValidation(): void
    {
        $user = $this->user();

        if ($user->isSiswa()) {
            $this->replace([
                'full_name' => $this->input('full_name'),
                'phone' => $this->input('phone'),
            ]);
        }
    }
}
<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserStoreRequest extends FormRequest
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
        $role = $this->input('role');

        $base = [
            'role' => ['required', Rule::in(['admin', 'guru'])],
            'email' => ['required', 'email', 'unique:users,email'],
            'username' => ['nullable', 'string', 'max:255'],
            'password' => ['required', 'string', 'min:8']
        ];

        if ($role === 'guru') {
            $base = array_merge($base, [
                'full_name' => ['required', 'string', 'max:255'],
                'nip' => ['required', 'string', 'max:50', 'unique:guru_profiles,nip'],
                'gender' => ['required', Rule::in(['laki-laki', 'perempuan'])],
                'phone' => ['required', 'string', 'max:30'],
                'kelas_id' => ['required', 'exists:kelas,id'],
                'mapel_id' => ['required', 'exists:mapels,id'],
            ]);
        }

        return $base;
    }
}

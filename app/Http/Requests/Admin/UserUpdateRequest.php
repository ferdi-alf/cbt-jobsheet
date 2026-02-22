<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserUpdateRequest extends FormRequest
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
        $userId = $this->route('user')?->id;

        return [
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'username' => ['sometimes', 'nullable', 'string', 'max:255'],
            'password' => ['nullable', 'string', 'min:8'],

            // kalau user yang diedit role guru, field ini akan dipakai
            'full_name' => ['sometimes', 'string', 'max:255'],
            'nip' => ['sometimes', 'string', 'max:50', Rule::unique('guru_profiles', 'nip')->ignore($userId, 'user_id')],
            'gender' => ['sometimes', Rule::in(['laki-laki', 'perempuan'])],
            'phone' => ['sometimes', 'string', 'max:30'],
            'kelas_id' => ['sometimes', 'exists:kelas,id'],
            'mapel_id' => ['sometimes', 'exists:mapels,id'],
        ];
    }
}

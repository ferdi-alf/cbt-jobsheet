<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StudentUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        $userId = $this->route('student')?->id ?? $this->route('user')?->id;

        return [
            'kelas_id' => ['required', 'integer', 'exists:kelas,id'],

            'username' => ['required', 'string', 'max:100'],
            'email' => [
                'required', 'email', 'max:150',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'password' => ['nullable', 'string', 'min:6', 'max:100'],

            'full_name' => ['required', 'string', 'max:150'],
            'nisn' => [
                'required', 'string', 'max:30',
                Rule::unique('siswa_profiles', 'nisn')->ignore($userId, 'user_id'),
            ],
            'gender' => ['required', 'in:laki-laki,perempuan'],
            'phone' => ['required', 'string', 'max:30'],
        ];
    }

    public function messages(): array
    {
        return [
            'kelas_id.required' => 'Kelas wajib dipilih.',
            'kelas_id.exists' => 'Kelas tidak valid.',

            'username.required' => 'Username wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah digunakan.',
            'password.min' => 'Password minimal :min karakter.',

            'full_name.required' => 'Nama lengkap wajib diisi.',
            'nisn.unique' => 'NISN sudah digunakan.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'data' => null,
            'error' => 'VALIDATION_ERROR',
            'errors' => $validator->errors(),
        ], 422));
    }
}
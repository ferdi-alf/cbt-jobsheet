<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StudentBulkStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'kelas_id'             => ['required', 'integer', 'exists:kelas,id'],
            'students'             => ['required', 'array', 'min:1', 'max:200'],
            'students.*.nisn'      => ['required', 'string', 'max:30', 'distinct',
                                        'unique:siswa_profiles,nisn'],
            'students.*.full_name' => ['required', 'string', 'max:150'],
            'students.*.username'  => ['nullable', 'string', 'max:100'],
            'students.*.email'     => ['nullable', 'email', 'max:150'],
            'students.*.password'  => ['nullable', 'string', 'min:6', 'max:100'],
            'students.*.gender'    => ['nullable', 'in:laki-laki,perempuan'],
            'students.*.phone'     => ['nullable', 'string', 'max:30'],
        ];
    }

    public function attributes(): array
    {
        return [
            'kelas_id'             => 'kelas',
            'students.*.nisn'      => 'NISN siswa',
            'students.*.full_name' => 'nama lengkap siswa',
            'students.*.username'  => 'username siswa',
            'students.*.email'     => 'email siswa',
            'students.*.password'  => 'password siswa',
            'students.*.gender'    => 'gender siswa',
            'students.*.phone'     => 'nomor HP siswa',
        ];
    }

    public function messages(): array
    {
        return [
            'kelas_id.required' => 'Kelas wajib dipilih.',
            'kelas_id.exists' => 'Kelas tidak valid.',

            'students.required' => 'Minimal harus ada 1 siswa.',
            'students.array' => 'Format siswa tidak valid.',
            'students.min' => 'Minimal harus ada 1 siswa.',

            'students.*.username.required' => 'Username wajib diisi.',
            'students.*.username.max' => 'Username maksimal :max karakter.',

            'students.*.email.required' => 'Email wajib diisi.',
            'students.*.email.email' => 'Format email tidak valid.',
            'students.*.email.max' => 'Email maksimal :max karakter.',
            'students.*.email.distinct' => 'Email duplikat dalam input.',
            'students.*.email.unique' => 'Email sudah digunakan.',

            'students.*.password.required' => 'Password wajib diisi.',
            'students.*.password.min' => 'Password minimal :min karakter.',
            'students.*.password.max' => 'Password maksimal :max karakter.',

            'students.*.full_name.required' => 'Nama lengkap wajib diisi.',
            'students.*.full_name.max' => 'Nama lengkap maksimal :max karakter.',

            'students.*.nisn.required' => 'NISN wajib diisi.',
            'students.*.nisn.max' => 'NISN maksimal :max karakter.',
            'students.*.nisn.distinct' => 'NISN duplikat dalam input.',
            'students.*.nisn.unique' => 'NISN sudah digunakan.',

            'students.*.gender.required' => 'Gender wajib dipilih.',
            'students.*.gender.in' => 'Gender tidak valid.',

            'students.*.phone.required' => 'Nomor HP wajib diisi.',
            'students.*.phone.max' => 'Nomor HP maksimal :max karakter.',
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
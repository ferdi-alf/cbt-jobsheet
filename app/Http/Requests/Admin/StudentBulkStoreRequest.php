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
            'kelas_id' => ['required', 'integer', 'exists:kelas,id'],

            'students' => ['required', 'array', 'min:1', 'max:200'],

            'students.*.username' => ['required', 'string', 'max:100'],
            'students.*.email' => ['required', 'email', 'max:150', 'distinct', 'unique:users,email'],
            'students.*.password' => ['required', 'string', 'min:6', 'max:100'],

            'students.*.full_name' => ['required', 'string', 'max:150'],
            'students.*.nisn' => ['required', 'string', 'max:30', 'distinct', 'unique:siswa_profiles,nisn'],
            'students.*.gender' => ['required', 'in:laki-laki,perempuan'],
            'students.*.phone' => ['required', 'string', 'max:30'],
        ];
    }

    public function messages(): array
    {
        return [
            'students.*.email.distinct' => 'Email duplikat dalam input.',
            'students.*.email.unique' => 'Email sudah digunakan.',

            'students.*.nisn.distinct' => 'NISN duplikat dalam input.',
            'students.*.nisn.unique' => 'NISN sudah digunakan.',
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
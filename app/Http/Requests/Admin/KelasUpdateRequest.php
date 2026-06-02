<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class KelasUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        $kelas   = $this->route('kelas');
        $kelasId = is_object($kelas) ? $kelas->id : (int) $kelas;

        Log::info('KelasUpdate debug', [
            'route_kelas'  => $this->route('kelas'),
            'kelas_id'     => $kelasId,
            'kelas_type'   => gettype($this->route('kelas')),
        ]);

        if (!$kelasId) {
            $segments = explode('/', $this->path());
            $kelasId  = (int) end($segments);
        }

        return [
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('kelas', 'name')->ignore($kelasId),
            ],
            'jurusan_id'   => ['required', 'numeric', 'exists:jurusans,id'],
            'tingkat'      => ['required', 'string', 'in:X,XI,XII'],
            'tahun_ajaran' => ['required', 'string', 'max:9', 'regex:/^\d{4}\/\d{4}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'jurusan_id.required' => 'Jurusan wajib dipilih.',
            'jurusan_id.exists'   => 'Jurusan yang dipilih tidak valid.',
            'tahun_ajaran.regex'  => 'Format tahun ajaran harus: 2024/2025',
        ];
    }
}
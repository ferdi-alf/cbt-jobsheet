<?php

namespace App\Http\Requests\Petugas;

use App\Models\Kelas;
use App\Models\Mapel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class MateriStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['admin', 'guru'], true);
    }

    public function rules(): array
    {
        $isGuru = $this->user()?->role === 'guru';

        $base = [
            'title'          => ['required', 'string', 'max:255'],
            'praktik_text'   => ['nullable', 'string'],
            'k3_alat_bahan'      => ['nullable', 'string'],
            'elemen'             => ['nullable', 'string'],
            'tujuan_pembelajaran' => ['nullable', 'string'],
            'pdf'            => ['required', 'file', 'mimes:pdf', 'max:10240'],
        ];

        if ($isGuru) {
            return $base;
        }

        return array_merge($base, [
            'kelas_id' => ['required', 'exists:kelas,id'],
            'mapel_id' => ['required', 'exists:mapels,id'],
        ]);
    }

    public function withValidator(Validator $validator): void
    {
        if ($this->user()?->role === 'guru') return;

        $validator->after(function (Validator $v) {
            $this->validateFaseVsTingkat($v);
        });
    }

    private function validateFaseVsTingkat(Validator $v): void
    {
        $kelasId = $this->input('kelas_id');
        $mapelId = $this->input('mapel_id');

        if (!$kelasId || !$mapelId) return;

        $kelas = Kelas::find($kelasId, ['id', 'tingkat']);
        $mapel = Mapel::find($mapelId, ['id', 'fase']);

        if (!$kelas || !$mapel || !$kelas->tingkat || !$mapel->fase) return;

        $expectedFase = $kelas->tingkat === 'X' ? 'E' : 'F';

        $mapelFases = explode(',', $mapel->fase);

        if (!in_array($expectedFase, $mapelFases, true)) {
            $v->errors()->add(
                'mapel_id',
                "Mapel ini adalah Fase {$mapel->fase}, tidak sesuai dengan tingkat kelas {$kelas->tingkat} (Fase {$expectedFase})."
            );
        }
    }
}
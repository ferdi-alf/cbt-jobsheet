<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Kelas;

class KelasSeeder extends Seeder
{
    public function run(): void
    {
        $kelas = [
            'X RPL 1',
            'X RPL 2',
            'XI RPL 1',
            'XI RPL 2',
            'XII RPL 1',
            'XII RPL 2',
        ];

        foreach ($kelas as $name) {
            Kelas::firstOrCreate(['name' => $name]);
        }
    }
}
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Mapel;

class MapelSeeder extends Seeder
{
    public function run(): void
    {
        $mapels = [
            'Pemrograman Web',
            'Basis Data',
            'Jaringan Komputer',
        ];

        foreach ($mapels as $name) {
            Mapel::firstOrCreate(['name' => $name]);
        }
    }
}
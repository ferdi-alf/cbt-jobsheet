<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            // KelasSeeder::class,
            // MapelSeeder::class,
            AdminUserSeeder::class,
            // DumySeeder::class
        ]);
    }
}
<?php

use Illuminate\Database\Migrations\Migration;

use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Guru
        DB::statement("ALTER TABLE guru_profiles MODIFY gender ENUM('laki-laki','perempuan') NOT NULL");

        DB::statement("ALTER TABLE siswa_profiles MODIFY gender ENUM('laki-laki','perempuan') NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE guru_profiles MODIFY gender ENUM('L','P') NOT NULL");
        DB::statement("ALTER TABLE siswa_profiles MODIFY gender ENUM('L','P') NOT NULL");
    }
};
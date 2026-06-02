<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kelas', function (Blueprint $table) {
            $table->foreignId('jurusan_id')
                ->nullable()
                ->after('name')
                ->constrained('jurusans')
                ->nullOnDelete();

            $table->enum('tingkat', ['X', 'XI', 'XII'])
                ->after('jurusan_id')
                ->nullable();

            $table->string('tahun_ajaran', 9)
                ->after('tingkat')
                ->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('kelas', function (Blueprint $table) {
            $table->dropForeign(['jurusan_id']);
            $table->dropColumn(['jurusan_id', 'tingkat', 'tahun_ajaran']);
        });
    }
};
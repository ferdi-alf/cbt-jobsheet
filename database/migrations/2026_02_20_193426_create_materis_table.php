<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('materis', function (Blueprint $table) {
            $table->id();

            $table->string('title');
            $table->string('pdf_path');
            $table->longText('steps');
            $table->longText('praktik_text')->nullable();

            $table->foreignId('kelas_id')
                ->constrained('kelas')
                ->restrictOnDelete();

            $table->foreignId('mapel_id')
                ->constrained('mapels')
                ->restrictOnDelete();
            $table->foreignId('teacher_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->foreignId('created_by')
                ->constrained('users')
                ->restrictOnDelete();

            $table->timestamps();

            $table->index(['kelas_id', 'mapel_id']);
            $table->index('teacher_user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('materis');
    }
};
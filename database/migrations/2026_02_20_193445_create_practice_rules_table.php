<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('practice_rules', function (Blueprint $table) {
            $table->id();

            $table->foreignId('materi_id')
                ->constrained('materis')
                ->cascadeOnDelete()
                ->unique();

            $table->string('title');
            $table->dateTime('deadline_at')->nullable();

            $table->foreignId('created_by')
                ->constrained('users')
                ->restrictOnDelete();

            $table->timestamps();

            $table->index('deadline_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('practice_rules');
    }
};
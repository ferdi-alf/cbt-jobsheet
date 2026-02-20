<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('practice_submissions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('materi_id')
                ->constrained('materis')
                ->cascadeOnDelete();

            $table->foreignId('student_user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->enum('status', ['draft', 'submitted', 'graded'])->default('draft');
            $table->boolean('is_late')->default(false);

            $table->dateTime('submitted_at')->nullable();

            $table->unsignedInteger('total_score')->nullable();
            $table->text('feedback')->nullable();

            $table->foreignId('graded_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->dateTime('graded_at')->nullable();

            $table->timestamps();

            $table->unique(['materi_id', 'student_user_id']);
            $table->index(['student_user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('practice_submissions');
    }
};
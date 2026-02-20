<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('test_questions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('test_id')
                ->constrained('tests')
                ->cascadeOnDelete();

            $table->text('question');

            $table->text('option_a');
            $table->text('option_b');
            $table->text('option_c');
            $table->text('option_d');
            $table->text('option_e');

            $table->enum('correct_option', ['a', 'b', 'c', 'd', 'e']);
            $table->unsignedInteger('order')->default(1);

            $table->timestamps();

            $table->index(['test_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('test_questions');
    }
};
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('practice_submission_tools', function (Blueprint $table) {
            $table->id();

            $table->foreignId('submission_id')
                ->constrained('practice_submissions')
                ->cascadeOnDelete();

            // Baris yang didefinisikan guru (null = baris tambahan dari siswa)
            $table->foreignId('rule_tool_id')
                ->nullable()
                ->constrained('practice_rule_tools')
                ->nullOnDelete();

            $table->enum('kind', ['alat', 'bahan']);
            $table->string('label')->nullable();
            $table->text('value')->nullable();
            $table->string('photo_path')->nullable();
            $table->unsignedInteger('order')->default(1);

            $table->timestamps();

            $table->index(['submission_id', 'kind', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('practice_submission_tools');
    }
};

<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('practice_submission_tool_photos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('submission_id')
                ->constrained('practice_submissions')
                ->cascadeOnDelete();

            // Foto dokumentasi untuk baris Alat/Bahan definisi guru
            $table->foreignId('rule_tool_id')
                ->constrained('practice_rule_tools')
                ->cascadeOnDelete();

            $table->string('photo_path');
            $table->timestamps();

            $table->index(['submission_id', 'rule_tool_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('practice_submission_tool_photos');
    }
};

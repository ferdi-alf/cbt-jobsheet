<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('practice_submission_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('submission_id')
                ->constrained('practice_submissions')
                ->cascadeOnDelete();

            $table->foreignId('checklist_id')
                ->constrained('practice_checklists')
                ->restrictOnDelete();

            $table->text('note')->nullable();

            $table->timestamps();

            $table->unique(['submission_id', 'checklist_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('practice_submission_items');
    }
};
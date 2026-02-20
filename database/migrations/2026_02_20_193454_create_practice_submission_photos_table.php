<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('practice_submission_photos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('submission_item_id')
                ->constrained('practice_submission_items')
                ->cascadeOnDelete();

            $table->string('photo_path');

            $table->timestamps();

            $table->index('submission_item_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('practice_submission_photos');
    }
};
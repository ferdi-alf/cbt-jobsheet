<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('practice_submission_apd_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')
                ->constrained('practice_submissions')
                ->cascadeOnDelete();
            $table->string('photo_path');
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('practice_submission_apd_photos');
    }
};

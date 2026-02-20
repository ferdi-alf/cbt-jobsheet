<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('practice_checklists', function (Blueprint $table) {
            $table->id();

            $table->foreignId('practice_rule_id')
                ->constrained('practice_rules')
                ->cascadeOnDelete();

            $table->string('title');
            $table->unsignedInteger('order')->default(1);

            $table->timestamps();

            $table->index(['practice_rule_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('practice_checklists');
    }
};
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('practice_rule_tools', function (Blueprint $table) {
            $table->id();

            $table->foreignId('practice_rule_id')
                ->constrained('practice_rules')
                ->cascadeOnDelete();

            // 'alat' = tools, 'bahan' = materials
            $table->enum('kind', ['alat', 'bahan']);
            $table->string('label');
            $table->unsignedInteger('order')->default(1);

            $table->timestamps();

            $table->index(['practice_rule_id', 'kind', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('practice_rule_tools');
    }
};

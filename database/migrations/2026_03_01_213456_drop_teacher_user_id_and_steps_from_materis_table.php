<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('materis', function (Blueprint $table) {
            if (Schema::hasColumn('materis', 'teacher_user_id')) {
                $table->dropForeign(['teacher_user_id']); 
                $table->dropColumn('teacher_user_id');
            }

            if (Schema::hasColumn('materis', 'steps')) {
                $table->dropColumn('steps');
            }
        });
    }

    public function down(): void
    {
        Schema::table('materis', function (Blueprint $table) {
            if (!Schema::hasColumn('materis', 'teacher_user_id')) {
                $table->foreignId('teacher_user_id')
                    ->nullable()
                    ->constrained('users')
                    ->nullOnDelete();
            }

            if (!Schema::hasColumn('materis', 'steps')) {
                $table->longText('steps')->nullable();
            }
        });
    }
};
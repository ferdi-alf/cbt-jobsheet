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
        Schema::table('practice_checklists', function (Blueprint $table) {
            $table->string('standar')->nullable()->after('title');
            $table->text('keterangan')->nullable()->after('standar');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('practice_checklists', function (Blueprint $table) {
            $table->dropColumn(['standar', 'keterangan']);
        });
    }
};

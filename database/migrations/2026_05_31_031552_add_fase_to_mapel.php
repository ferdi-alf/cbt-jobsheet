<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mapels', function (Blueprint $table) {
            $table->enum('fase', ['E', 'F', 'E,F'])->nullable()->after('name');
        });
    }

    public function down(): void
    {
        Schema::table('mapels', function (Blueprint $table) {
            $table->dropColumn('fase');
        });
    }
};
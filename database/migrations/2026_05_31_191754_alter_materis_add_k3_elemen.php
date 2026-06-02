<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('materis', function (Blueprint $table) {
            $table->text('k3_alat_bahan')->nullable()->after('praktik_text');
            $table->text('elemen_tujuan')->nullable()->after('k3_alat_bahan');
        });
    }

    public function down(): void
    {
        Schema::table('materis', function (Blueprint $table) {
            $table->dropColumn(['k3_alat_bahan', 'elemen_tujuan']);
        });
    }
};
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('practice_submissions', function (Blueprint $table) {
            // 3 komponen nilai (0-100). total_score = 25% AB + 15% SOP/APD/K3L + 60% Praktek.
            $table->unsignedTinyInteger('score_alat_bahan')->nullable()->after('total_score');
            $table->unsignedTinyInteger('score_sop_k3l')->nullable()->after('score_alat_bahan');
            $table->unsignedTinyInteger('score_praktik')->nullable()->after('score_sop_k3l');
        });
    }

    public function down(): void
    {
        Schema::table('practice_submissions', function (Blueprint $table) {
            $table->dropColumn(['score_alat_bahan', 'score_sop_k3l', 'score_praktik']);
        });
    }
};

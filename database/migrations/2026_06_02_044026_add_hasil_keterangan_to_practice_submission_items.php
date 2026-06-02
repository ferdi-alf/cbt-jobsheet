<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   // add_hasil_keterangan_to_practice_submission_items
    public function up(): void
    {
        Schema::table('practice_submission_items', function (Blueprint $table) {
            $table->string('hasil')->nullable()->after('note');
            $table->text('keterangan')->nullable()->after('hasil');
        });
    }
    public function down(): void
    {
        Schema::table('practice_submission_items', function (Blueprint $table) {
            $table->dropColumn(['hasil', 'keterangan']);
        });
    }
};

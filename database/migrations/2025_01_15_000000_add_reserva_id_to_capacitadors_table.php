<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('capacitadors', function (Blueprint $table) {
            if (!Schema::hasColumn('capacitadors', 'reserva_id')) {
                $table->foreignId('reserva_id')->nullable()->constrained('reservas')->onDelete('cascade');
            }
        });
    }

    public function down(): void
    {
        Schema::table('capacitadors', function (Blueprint $table) {
            if (Schema::hasColumn('capacitadors', 'reserva_id')) {
                $table->dropForeign(['reserva_id']);
                $table->dropColumn('reserva_id');
            }
        });
    }
};
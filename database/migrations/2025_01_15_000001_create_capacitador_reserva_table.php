<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('capacitador_reserva')) {
            Schema::create('capacitador_reserva', function (Blueprint $table) {
                $table->id();
                $table->foreignId('capacitador_id')->constrained('capacitadors')->onDelete('cascade');
                $table->foreignId('reserva_id')->constrained('reservas')->onDelete('cascade');
                $table->timestamps();
                
                $table->unique(['capacitador_id', 'reserva_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('capacitador_reserva');
    }
};
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
       Schema::create('control_usos', function (Blueprint $table) {
    $table->id();
    $table->foreignId('reserva_id')->constrained()->onDelete('cascade');
    $table->boolean('fue_utilizada')->default(false);
    $table->text('observaciones')->nullable();
    $table->timestamps();
});

    }

  
    public function down(): void
    {
        Schema::dropIfExists('control_usos');
    }
};

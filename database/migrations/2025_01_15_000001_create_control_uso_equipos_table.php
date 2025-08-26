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
        Schema::create('control_uso_equipos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('control_uso_id')->constrained('control_usos')->onDelete('cascade');
            $table->foreignId('equipo_id')->constrained('equipos')->onDelete('cascade');
            $table->string('estado_pantalla')->nullable();
            $table->string('estado')->nullable();
            $table->boolean('se_encendio')->nullable();
            $table->boolean('se_apago')->nullable();
            $table->boolean('se_conecto_a_cargar')->nullable();
            $table->integer('nivel_bateria')->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamps();
            
            $table->unique(['control_uso_id', 'equipo_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('control_uso_equipos');
    }
};
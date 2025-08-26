<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Hacer la columna nullable primero
        Schema::table('reservas', function (Blueprint $table) {
            $table->unsignedBigInteger('responsable_id')->nullable()->change();
        });

        // Actualizar registros con responsable_id inválidos
        DB::table('reservas')
            ->whereNotNull('responsable_id')
            ->whereNotExists(function ($query) {
                $query->select(DB::raw(1))
                      ->from('responsables')
                      ->whereRaw('responsables.id = reservas.responsable_id');
            })
            ->update(['responsable_id' => null]);

        // Agregar la clave foránea
        Schema::table('reservas', function (Blueprint $table) {
           $table->foreign('responsable_id')->references('id')->on('responsables')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservas', function (Blueprint $table) {
            $table->dropForeign(['responsable_id']);
            $table->dropColumn('responsable_id');
        });
    }
};

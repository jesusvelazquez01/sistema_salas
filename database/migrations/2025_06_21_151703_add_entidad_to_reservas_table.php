<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('reservas', function (Blueprint $table) {
            $table->string('entidad')->nullable()->after('user_id'); // o cambiá la posición si querés
        });
    }

    public function down()
    {
        Schema::table('reservas', function (Blueprint $table) {
            $table->dropColumn('entidad');
        });
    }
};


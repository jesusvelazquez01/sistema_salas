<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Equipo;
use App\Models\Sala;

class HistorialEquipoController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:ver Equipo')->only(['index']);
    }

    public function index()
    {
        $historial = DB::table('control_uso_equipos')
            ->join('control_usos', 'control_uso_equipos.control_uso_id', '=', 'control_usos.id')
            ->join('reservas', 'control_usos.reserva_id', '=', 'reservas.id')
            ->join('equipos', 'control_uso_equipos.equipo_id', '=', 'equipos.id')
            ->join('salas', 'equipos.sala_id', '=', 'salas.id')
            ->join('users', 'reservas.user_id', '=', 'users.id')
            ->select([
                'control_uso_equipos.*',
                'equipos.marca',
                'equipos.modelo',
                'salas.nombre as sala_nombre',
                'reservas.fecha',
                'reservas.responsable',
                'reservas.entidad',
                'users.name as usuario_creador'
            ])
            ->orderBy('reservas.fecha', 'desc')
            ->paginate(10);

        return Inertia::render('control-uso/HistorialEquipos', [
            'historial' => $historial
        ]);
    }
}
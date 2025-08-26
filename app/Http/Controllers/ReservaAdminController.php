<?php

namespace App\Http\Controllers;

use App\Models\Reserva;
use App\Models\Sala;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReservaAdminController extends Controller
{
    public function index()
    {
        return Inertia::render('reservas/ReservasAdmin', [
            'reservas' => Reserva::with('sala')
                ->orderBy('fecha', 'desc')
                ->orderBy('hora_inicio', 'desc')
                ->paginate(10),
            'salas' => Sala::all(),
        ]);
    }
}
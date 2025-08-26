<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;    
use Inertia\Inertia;
use App\Models\Sala;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $now = Carbon::now();
        $hoy = $now->toDateString();

        $reservasEnCurso = \App\Models\Reserva::with('sala', 'user')
            ->whereDate('fecha', $hoy)
            ->get();
            
        return Inertia::render('dashboard', [
            'reservasEnCurso' => $reservasEnCurso,
            'salas' => Sala::all()
        ]);
    }
}
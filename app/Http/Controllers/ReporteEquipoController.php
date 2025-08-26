<?php

namespace App\Http\Controllers;

use App\Models\Equipo;
use App\Models\ControlUso;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReporteEquipoController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:ver Equipo')->only(['usoEquipos']);
    }

    public function usoEquipos(Request $request)
    {
        // 1. Obtener equipos con conteo de usos filtrado
        $equipos = Equipo::withCount(['controlesUso' => function($query) use ($request) {
            if ($request->fecha_inicio) {
                $query->whereHas('reserva', function($q) use ($request) {
                    $q->whereDate('fecha', '>=', $request->fecha_inicio);
                });
            }
            if ($request->fecha_fin) {
                $query->whereHas('reserva', function($q) use ($request) {
                    $q->whereDate('fecha', '<=', $request->fecha_fin);
                });
            }
            if ($request->sala_id) {
                $query->whereHas('reserva', function($q) use ($request) {
                    $q->where('sala_id', $request->sala_id);
                });
            }
        }])->with('sala')->get();
        
        // Si hay filtro de equipo específico
        if ($request->equipo_id) {
            $equipos = $equipos->where('id', $request->equipo_id);
        }

        // 2. Preparar datos para gráfico de barras
        $labels = $equipos->map(function($equipo) {
            return $equipo->marca . ' ' . $equipo->modelo;
        })->toArray();
        $values = $equipos->pluck('controles_uso_count')->toArray();

        // 3. Colores para el gráfico
        $backgroundColors = [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)', 
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
        ];
        $borderColors = [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
        ];

        // 4. Obtener datos mensuales
        $monthlyData = $this->getMonthlyData($request);
        
        // 5. Obtener todos los equipos y salas para filtros
        $todosLosEquipos = Equipo::with('sala')->get();
        $todasLasSalas = \App\Models\Sala::select('id', 'nombre')->get();

        // 6. Renderizar el componente Inertia
        return Inertia::render('reportes/reporteEquipos', [
            'chartLabels' => $labels,
            'chartValues' => $values,
            'backgroundColors' => $backgroundColors,
            'borderColors' => $borderColors,
            'monthlyData' => $monthlyData,
            'equipos' => $todosLosEquipos,
            'salas' => $todasLasSalas,
        ]);
    }

    private function getMonthlyData($request = null)
    {
        $query = DB::table('control_uso_equipos')
            ->join('control_usos', 'control_uso_equipos.control_uso_id', '=', 'control_usos.id')
            ->join('reservas', 'control_usos.reserva_id', '=', 'reservas.id')
            ->select(
                DB::raw('EXTRACT(YEAR FROM reservas.fecha) as year'),
                DB::raw('EXTRACT(MONTH FROM reservas.fecha) as month'),
                DB::raw('COUNT(*) as total')
            )
            ->where('reservas.fecha', '>=', Carbon::now()->subMonths(11)->startOfMonth());
        
        if ($request) {
            if ($request->equipo_id) {
                $query->where('control_uso_equipos.equipo_id', $request->equipo_id);
            }
            if ($request->sala_id) {
                $query->where('reservas.sala_id', $request->sala_id);
            }
        }
        
        $monthlyUsos = $query->groupBy('year', 'month')
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get();

        // Crear array con todos los meses (últimos 12)
        $months = [];
        $values = [];
        
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthKey = $date->year . '-' . $date->month;
            $months[] = $date->locale('es')->isoFormat('MMM YYYY');
            
            // Buscar si hay datos para este mes
            $found = $monthlyUsos->first(function ($item) use ($date) {
                return $item->year == $date->year && $item->month == $date->month;
            });
            
            $values[] = $found ? $found->total : 0;
        }

        return [
            'labels' => $months,
            'values' => $values
        ];
    }
}

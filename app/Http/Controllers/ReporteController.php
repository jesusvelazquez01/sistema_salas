<?php

namespace App\Http\Controllers;

use App\Models\Sala;
use App\Models\Reserva;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReporteController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:ver ControlUso')->only(['index']);
    }
    public function usoSalas(Request $request)
    {
        $salas = Sala::withCount(['reservas' => function($query) use ($request) {
            if ($request->fecha_inicio) {
                $query->whereDate('fecha', '>=', $request->fecha_inicio);
            }
            if ($request->fecha_fin) {
                $query->whereDate('fecha', '<=', $request->fecha_fin);
            }
            if ($request->entidad) {
                $query->where('entidad', $request->entidad);
            }
        }])->get();

        if ($request->sala_id) {
            $salas = $salas->where('id', $request->sala_id);
        }

        $labels = $salas->pluck('nombre')->toArray();
        $values = $salas->pluck('reservas_count')->toArray();

        $backgroundColors = [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
        ];
        $borderColors = [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
        ];

        $monthlyData = $this->getMonthlyData($request);
        $weeklyData = $this->getWeeklyData($request);

        $todasLasSalas = Sala::select('id', 'nombre')->get();
        $entidades = Reserva::distinct()->pluck('entidad')->filter()->values();

        return Inertia::render('reportes/Reporte', [
            'chartLabels' => $labels,
            'chartValues' => $values,
            'backgroundColors' => $backgroundColors,
            'borderColors' => $borderColors,
            'monthlyData' => $monthlyData,
            'weeklyData' => $weeklyData,
            'salas' => $todasLasSalas,
            'entidades' => $entidades,
        ]);
    }

    private function getMonthlyData($request = null)
    {
        $query = Reserva::select(
            DB::raw('EXTRACT(YEAR FROM fecha) as year'),
            DB::raw('EXTRACT(MONTH FROM fecha) as month'),
            DB::raw('COUNT(*) as total')
        )
        ->where('fecha', '>=', Carbon::now()->subMonths(11)->startOfMonth());

        if ($request) {
            if ($request->sala_id) {
                $query->where('sala_id', $request->sala_id);
            }
            if ($request->entidad) {
                $query->where('entidad', $request->entidad);
            }
        }

        $monthlyReservas = $query->groupBy('year', 'month')
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get();

        $months = [];
        $values = [];

        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $months[] = $date->locale('es')->isoFormat('MMM YYYY');

            $found = $monthlyReservas->first(function ($item) use ($date) {
                return $item->year == $date->year && $item->month == $date->month;
            });

            $values[] = $found ? $found->total : 0;
        }

        return [
            'labels' => $months,
            'values' => $values
        ];
    }

    private function getWeeklyData($request = null)
    {
        $query = Reserva::select(
            DB::raw('EXTRACT(WEEK FROM fecha) as week'),
            DB::raw('COUNT(*) as total')
        )
        ->where('fecha', '>=', Carbon::now()->subWeeks(3)->startOfWeek());

        if ($request) {
            if ($request->sala_id) {
                $query->where('sala_id', $request->sala_id);
            }
            if ($request->entidad) {
                $query->where('entidad', $request->entidad);
            }
        }

        $weeklyReservas = $query->groupBy('week')
            ->orderBy('week', 'asc')
            ->get();

        $weeks = [];
        $values = [];

        for ($i = 3; $i >= 0; $i--) {
            $startOfWeek = Carbon::now()->subWeeks($i)->startOfWeek();
            $endOfWeek = Carbon::now()->subWeeks($i)->endOfWeek();

            $weeks[] = $startOfWeek->locale('es')->isoFormat('DD MMM') . ' - ' . $endOfWeek->locale('es')->isoFormat('DD MMM');

            $currentWeek = $startOfWeek->weekOfYear;
            $found = $weeklyReservas->first(function ($item) use ($currentWeek) {
                return $item->week == $currentWeek;
            });

            $values[] = $found ? $found->total : 0;
        }

        return [
            'labels' => $weeks,
            'values' => $values
        ];
    }
}

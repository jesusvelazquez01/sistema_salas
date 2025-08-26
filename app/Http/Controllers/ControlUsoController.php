<?php

namespace App\Http\Controllers;

use App\Models\ControlUso;
use App\Models\Reserva;
use App\Models\Equipo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ControlUsoController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:ver ControlUso')->only(['index']);
        $this->middleware('permission:crear ControlUso')->only(['store']);
        $this->middleware('permission:editar ControlUso')->only(['update']);
        $this->middleware('permission:eliminar ControlUso')->only(['destroy']);
    }
    
    public function index()
    {
        return Inertia::render('control-uso/ControlUso', [
            'controles' => ControlUso::with('reserva.sala', 'reserva.user')
                ->latest()->get(),
            'reservas' => Reserva::with('sala', 'user')
                ->whereDoesntHave('controlUso')
                ->latest()->get(),
            'equipos' => Equipo::with('sala')->get(),
            'equiposPorSala' => Equipo::with('sala')->get()->groupBy('sala_id'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'reserva_id' => 'required|exists:reservas,id',
            'fue_utilizada' => 'required|boolean',
            'observaciones' => 'nullable|string|max:1000',
            'equipos' => 'nullable|array',
            'equipos.*.equipo_id' => 'required|exists:equipos,id',
            'equipos.*.estado_pantalla' => 'nullable|string',
            'equipos.*.estado_final' => 'nullable|string',
            'equipos.*.se_encendio' => 'nullable|boolean',
            'equipos.*.se_apago' => 'nullable|boolean',
            'equipos.*.se_conecto_a_cargar' => 'nullable|boolean',
            'equipos.*.nivel_bateria' => 'nullable|integer|min:0|max:100',
            'equipos.*.observaciones_equipo' => 'nullable|string|max:500',
        ]);

        $reserva = Reserva::findOrFail($validated['reserva_id']);

        $control = ControlUso::create([
            'reserva_id' => $validated['reserva_id'],
            'fue_utilizada' => $validated['fue_utilizada'],
            'observaciones' => $validated['observaciones'],
        ]);

        if (!empty($validated['equipos'])) {
            $equiposData = [];
            foreach ($validated['equipos'] as $equipoData) {
                $equiposData[$equipoData['equipo_id']] = [
                    'estado_pantalla' => $equipoData['estado_pantalla'] ?? null,
                    'estado' => $equipoData['estado_final'] ?? null,
                    'se_encendio' => $equipoData['se_encendio'] ?? null,
                    'se_apago' => $equipoData['se_apago'] ?? null,
                    'se_conecto_a_cargar' => $equipoData['se_conecto_a_cargar'] ?? null,
                    'nivel_bateria' => $equipoData['nivel_bateria'] ?? null,
                    'observaciones' => $equipoData['observaciones_equipo'] ?? null,
                ];
            }
            $control->equipos()->sync($equiposData);
        }

        return redirect()->back()->with('success', 'Control de uso registrado.');
    }

    public function update(Request $request, ControlUso $control)
    {

        $validated = $request->validate([
            'reserva_id' => 'required|exists:reservas,id',
            'fue_utilizada' => 'required|boolean',
            'observaciones' => 'nullable|string|max:1000',
            'equipos' => 'nullable|array',
            'equipos.*.equipo_id' => 'required|exists:equipos,id',
            'equipos.*.estado_pantalla' => 'nullable|string',
            'equipos.*.estado_final' => 'nullable|string',
            'equipos.*.se_encendio' => 'nullable|boolean',
            'equipos.*.se_apago' => 'nullable|boolean',
            'equipos.*.se_conecto_a_cargar' => 'nullable|boolean',
            'equipos.*.nivel_bateria' => 'nullable|integer|min:0|max:100',
            'equipos.*.observaciones_equipo' => 'nullable|string|max:500',
        ]);

        $control->update([
            'reserva_id' => $validated['reserva_id'],
            'fue_utilizada' => $validated['fue_utilizada'],
            'observaciones' => $validated['observaciones'],
        ]);

        if (!empty($validated['equipos'])) {
            $equiposData = [];
            foreach ($validated['equipos'] as $equipoData) {
                $equiposData[$equipoData['equipo_id']] = [
                    'estado_pantalla' => $equipoData['estado_pantalla'] ?? null,
                    'estado' => $equipoData['estado_final'] ?? null,
                    'se_encendio' => $equipoData['se_encendio'] ?? null,
                    'se_apago' => $equipoData['se_apago'] ?? null,
                    'se_conecto_a_cargar' => $equipoData['se_conecto_a_cargar'] ?? null,
                    'nivel_bateria' => $equipoData['nivel_bateria'] ?? null,
                    'observaciones' => $equipoData['observaciones_equipo'] ?? null,
                ];
            }
            $control->equipos()->sync($equiposData);
        } else {
            $control->equipos()->detach();
        }

        return redirect()->back()->with('success', 'Control de uso actualizado.');
    }

    public function destroy(ControlUso $control)
    {

        $control->delete();

        return redirect()->back()->with('success', 'Registro de control de uso eliminado.');
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\Equipo;
use App\Models\Sala;
use Inertia\Inertia;
use Illuminate\Http\Request;

class EquipoController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:ver Equipo')->only(['index']);
        $this->middleware('permission:crear Equipo')->only(['store']);
        $this->middleware('permission:editar Equipo')->only(['update']);
        $this->middleware('permission:eliminar Equipo')->only(['destroy']);
    }
    
    public function index()
    {
        return Inertia::render('equipos/Equipo', [
            'equipos' => Equipo::with('sala')->get(),
            'salas' => Sala::all(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'marca' => 'required|string|max:255',
            'modelo' => 'required|string|max:255',
            'estado_inicial' => 'required|in:excelente,bueno,regular,malo',
            'sistema_operativo' => 'required|string|max:255',
            'fecha_adquisicion' => 'required|date',
            'fecha_baja' => 'nullable|date|after:fecha_adquisicion',
            'sala_id' => 'required|exists:salas,id',
        ]);

        Equipo::create($request->all());

        return redirect()->back()->with('success', 'Equipo creado exitosamente.');
    }

    public function update(Request $request, Equipo $equipo)
    {
        $request->validate([
            'marca' => 'required|string|max:255',
            'modelo' => 'required|string|max:255',
            'estado_inicial' => 'required|in:excelente,bueno,regular,malo',
            'sistema_operativo' => 'required|string|max:255',
            'fecha_adquisicion' => 'required|date',
            'fecha_baja' => 'nullable|date|after:fecha_adquisicion',
            'sala_id' => 'required|exists:salas,id',
        ]);

        $equipo->update($request->all());

        return redirect()->back()->with('success', 'Equipo actualizado exitosamente.');
    }

    public function destroy(Equipo $equipo)
    {
        $equipo->delete();

        return redirect()->back()->with('success', 'Equipo eliminado exitosamente.');
    }
}
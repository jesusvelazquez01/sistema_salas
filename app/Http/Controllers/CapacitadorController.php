<?php

namespace App\Http\Controllers;

use App\Models\Capacitador;
use App\Models\Reserva;
use Inertia\Inertia;
use Illuminate\Http\Request;

class CapacitadorController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:ver Capacitador')->only(['index']);
        $this->middleware('permission:crear Capacitador')->only(['store']);
        $this->middleware('permission:editar Capacitador')->only(['update']);
        $this->middleware('permission:eliminar Capacitador')->only(['destroy']);
    }
   
    public function index(Request $request)
    {
        $query = Capacitador::query();
        
        // Filtro por DNI
        if ($request->filled('dni')) {
            $query->where('dni', 'like', '%' . $request->dni . '%');
        }
        
        $capacitadores = $query->paginate(10)->withQueryString();
        
        return Inertia::render('capacitadores/Capacitador', [
            'capacitadores' => $capacitadores,
            'filters' => $request->only('dni')
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'dni' => 'required|string|max:255',
            'telefono' => 'required|string|max:255',
            'correo' => 'required|email|max:255',
        ]);

        Capacitador::create($request->all());

        return redirect()->back()->with('success', 'Capacitador creado exitosamente.');
    }

    public function update(Request $request, Capacitador $capacitador)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'dni' => 'required|string|max:255',
            'telefono' => 'required|string|max:255',
            'correo' => 'required|email|max:255',
        ]);

        $capacitador->update($request->all());

        return redirect()->back()->with('success', 'Capacitador actualizado exitosamente.');
    }

    public function destroy(Capacitador $capacitador)
    {
        $capacitador->delete();

        return redirect()->back()->with('success', 'Capacitador eliminado exitosamente.');
    }
}
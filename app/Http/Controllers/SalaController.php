<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sala;
use Inertia\Inertia; 

class SalaController extends Controller 
{
    public function __construct()
    {
        $this->middleware('permission:ver Sala')->only(['index']);
        $this->middleware('permission:crear Sala')->only(['store']);
        $this->middleware('permission:editar Sala')->only(['update']);
        $this->middleware('permission:eliminar Sala')->only(['destroy']);
    }
    
    public function index()
    {
        return Inertia::render('salas/Salas', [
            'salas' => Sala::all(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'capacidad' => 'required|integer|min:1',
            'ubicacion' => 'required|string|max:255',
        ]);

        Sala::create($request->all());

        return redirect()->route('salas.index');
    }

    public function update(Request $request, Sala $sala)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'capacidad' => 'required|integer|min:1',
            'ubicacion' => 'required|string|max:255',
        ]);

        $sala->update($request->all());

        return redirect()->route('salas.index');
    }

    public function destroy(Sala $sala)
    {
        $sala->delete();

        return redirect()->route('salas.index');
    }
}
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Responsable;
use Inertia\Inertia;
class ResponsableController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:ver Responsable')->only(['index']);
        $this->middleware('permission:crear Responsable')->only(['store']);
        $this->middleware('permission:editar Responsable')->only(['update']);
        $this->middleware('permission:eliminar Responsable')->only(['destroy']);
    }
  
    public function index(Request $request)
    {
        $query = Responsable::query();
        
        // Filtro por DNI
        if ($request->filled('dni')) {
            $query->where('dni', 'like', '%' . $request->dni . '%');
        }
        
        $responsables = $query->paginate(10)->withQueryString();
        
        return Inertia::render('responsables/Responsable', [
            'responsables' => $responsables,
            'filters' => $request->only('dni')
        ]);
    }
    public function store(Request $request)
    {
        
         $request->validate([
            'nombre' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'dni' => 'required|string|max:255',
            'telefono'=>'required|string|max:255',
            'correo'=>'required|string|max:255',
            'area'=>'required|string|max:255',

        ]);

        Responsable::create($request->all());

        return redirect()->route('responsables.index');
    }

    public function show(string $id)
    {
        
    }

    
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Responsable $responsable)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'dni' => 'required|string|max:255',
            'telefono'=>'required|string|max:255',
            'correo'=>'required|string|max:255',
            'area'=>'required|string|max:255',
        ]);

        $responsable->update($request->all());

        return redirect()->route('responsables.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Responsable $responsable)
    {
        $responsable->delete();
        return redirect()->route('responsables.index');
    }
}

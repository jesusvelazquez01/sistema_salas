<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Inertia\Inertia;

class UserRoleController extends Controller
{
   public function __construct()
    {
        $this->middleware('role:admin');
    }

    public function index(Request $request)
    {
        $search = $request->query('search');
        $users = User::with('roles')
            ->when($search, function($query, $search) {
                $query->where('name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%');
            })
            ->get();
            
        $roles = Role::all();
        
        return Inertia::render('usuario/Roles', [
           'usuarios' => $users,
           'roles' => $roles,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'roles' => 'required|array',
            'roles.*' => 'string|exists:roles,name',
        ]);
        
        $user->syncRoles($validated['roles']);
         
        return redirect()->route('usuarios.roles.index')->with('success', 'Roles actualizados exitosamente.');
    }

    public function destroy(string $id)
    {
        //
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Inertia\Inertia;

class RoleController extends Controller
{
    
    public function __construct()
    {
        $this->middleware('role:admin');
    }
    public function index(Request $request)
    {
        $search = $request->query('search');
        $roles = Role::query()
            ->withCount('permissions')
            ->when($search, function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->paginate(10)
            ->withQueryString();
            
        return Inertia::render('roles/Role', [
            'roles' => $roles
        ]);
    }

    public function edit(Role $role)
    {
        $permissions = Permission::all()->groupBy(function($permission) {
            return explode(' ', $permission->name)[1];
        });
        $rolePermissions = $role->permissions->pluck('name')->toArray();

        return Inertia::render('roles/Edit', [
            'role' => $role,
            'permissions' => $permissions,
            'rolePermissions' => $rolePermissions
        ]);
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role->syncPermissions($validated['permissions'] ?? []);
        
        return redirect()
            ->route('roles.index')
            ->with('success', 'Permisos del rol actualizados correctamente');
    }

    
}

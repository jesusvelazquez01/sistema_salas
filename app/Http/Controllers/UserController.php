<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('role:admin');
    }

    public function index(Request $request)
    {
        $search = $request->query('search');

        $users = User::with('roles')
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('usuarios/Index', [
            'users' => $users,
        ]);
    }

    public function create()
    {
        $roles = Role::all();
        return Inertia::render('usuarios/Create', [
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|min:6|confirmed',
                'role' => 'required|exists:roles,name',
            ]);
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);
            $user->assignRole($validated['role']);
            return redirect()
                ->route('users.index')
                ->with('success', 'Record created successfully.');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Failed to create record: ' . $e->getMessage());
        }
    }

    public function edit(User $user)
    {
        $roles = Role::all();
        return Inertia::render('usuarios/Edit', [
            'user' => $user->load('roles'),
            'roles' => $roles,
        ]);
    }

    public function update(Request $request, User $user)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,' . $user->id,
                'role' => 'required|exists:roles,name',
                'password' => 'nullable|min:6|confirmed',
            ]);
            
            $updateData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
            ];
            
            // Solo actualizar la contraseña si se proporciona
            if (!empty($validated['password'])) {
                $updateData['password'] = Hash::make($validated['password']);
            }
            
            $user->update($updateData);
            $user->syncRoles([$validated['role']]);
            
            return redirect()
                ->route('users.index')
                ->with('success', 'Usuario actualizado correctamente.');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Error al actualizar usuario: ' . $e->getMessage());
        }
    }

    public function destroy(User $user) {
        try {
            $user->delete();

            return redirect()
                ->route('users.index')
                ->with('success', 'Record deleted successfully.');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Failed to delete record: ' . $e->getMessage());
        }
    }
}
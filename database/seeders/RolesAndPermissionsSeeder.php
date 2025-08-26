<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        
        $entidadesPermisos = [
            'Sala' => ['ver', 'crear', 'editar', 'eliminar'],
            'Reserva' => ['ver', 'crear', 'editar', 'eliminar'],
            'Equipo' => ['ver', 'crear', 'editar', 'eliminar'],
            'Responsable' => ['ver', 'crear', 'editar', 'eliminar'],
            'ControlUso' => ['ver', 'crear', 'editar', 'eliminar'],
        ];
        
        foreach ($entidadesPermisos as $entidad => $permisos) {
            foreach ($permisos as $permiso) {
                Permission::firstOrCreate(['name' => $permiso . ' ' . $entidad]);
            }
        }
        
        $roles = ['admin', 'secretario'];
        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName]);
        }
        
        // Que permisos tendra cada rol
        $rolesPermissions = [
            'admin' => Permission::all()->pluck('name')->toArray(),
            'secretario' => [
                'ver Sala',
                'ver Reserva',
                'ver Equipo',
                'ver Responsable',
                'ver ControlUso',
                'crear Reserva',
                'crear Equipo',
                'crear Responsable',
                'crear ControlUso',
                'editar Reserva',
                'editar Equipo',
                'editar Responsable',
                'editar ControlUso',
                'eliminar Reserva',
                'eliminar Equipo',
                'eliminar Responsable',
                'eliminar ControlUso',
            ],
        ];

        foreach ($rolesPermissions as $roleName => $permissions) {
            $role = Role::where('name', $roleName)->first();
            $role->syncPermissions($permissions);
        }
    }
}

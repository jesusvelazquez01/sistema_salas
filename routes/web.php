<?php

use App\Http\Controllers\ReservaController;
use App\Http\Controllers\ReservaAdminController;
use App\Http\Controllers\EquipoController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\SalaController;
use App\Http\Controllers\ControlUsoController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReporteController;
use App\Http\Controllers\ResponsableController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserRoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\ReporteEquipoController;
use App\Http\Controllers\HistorialEquipoController;


Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');
});
Route::middleware(['auth'])->group(function () {
    Route::get('/salas/{sala}/reservas', [ReservaController::class, 'porSala'])->name('reservas.porSala');
});

//RUTAS DE RESPONSABLES 
Route::middleware(['auth'])->group(function () {
    Route::get('/admin/responsables', [ResponsableController::class, 'index'])->name('responsables.index');
    Route::post('admin/responsables', [ResponsableController::class, 'store'])->name('responsables.store');
    Route::put('/admin/responsables/{responsable}', [ResponsableController::class, 'update'])->name('responsables.update');
    Route::delete('/admin/responsables/{responsable}', [ResponsableController::class, 'destroy'])->name('responsables.destroy');
});
// RUTAS DE SALAS
Route::middleware(['auth'])->group(function () {
    Route::get('/admin/salas', [SalaController::class, 'index'])->name('salas.index');
    Route::post('admin/salas', [SalaController::class, 'store'])->name('salas.store');
    Route::put('/admin/salas/{sala}', [SalaController::class, 'update'])->name('salas.update');
    Route::delete('/admin/salas/{sala}', [SalaController::class, 'destroy'])->name('salas.destroy');
});

// RUTAS DE RESERVAS
Route::middleware(['auth'])->group(function () {
   Route::get('/reservas', [ReservaController::class, 'index'])->name('reservas.index');
    Route::post('/reservas', [ReservaController::class, 'store'])->name('reservas.store');
   Route::put('/reservas/{reserva}', [ReservaController::class, 'update'])->name('reservas.update');
    Route::delete('/reservas/{reserva}', [ReservaController::class, 'destroy'])->name('reservas.destroy');
    
    // Rutas de administración de reservas
    Route::get('/admin/reservas', [ReservaAdminController::class, 'index'])->name('reservas.admin.index');
});

// RUTAS DE EQUIPOS
Route::middleware(['auth'])->group(function () {
    Route::get('/equipos', [EquipoController::class, 'index'])->name('equipos.index');
    Route::post('/equipos', [EquipoController::class, 'store'])->name('equipos.store');
    Route::put('/equipos/{equipo}', [EquipoController::class, 'update'])->name('equipos.update');
    Route::delete('/equipos/{equipo}', [EquipoController::class, 'destroy'])->name('equipos.destroy');
});
//RUTAS DE CONTROL DE USO 
Route::middleware(['auth'])->group(function () {
    Route::get('/control-uso', [ControlUsoController::class, 'index'])->name('control-uso.index');
    Route::post('/control-uso', [ControlUsoController::class, 'store'])->name('control-uso.store');
    Route::put('/control-uso/{control}', [ControlUsoController::class, 'update'])->name('control-uso.update');
    Route::delete('/control-uso/{control}', [ControlUsoController::class, 'destroy'])->name('control-uso.destroy');
});
// REPORTES DE USO DE SALAS Y EQUIPOS
Route::middleware(['auth'])->group(function () {
    Route::get('/admin/reportes-uso', [ReporteController::class, 'usoSalas'])->name('reporte.usoSalas');
    Route::get('/admin/reportes-equipos', [ReporteEquipoController::class, 'usoEquipos'])->name('reporte.usoEquipos');
    Route::get('/admin/historial-equipos', [HistorialEquipoController::class, 'index'])->name('historial.equipos');
});

Route::middleware(['auth','verified','role:admin'])->group(function () {
    Route::get('/roles', [RoleController::class, 'index'])->name('roles.index');
    Route::get('/roles/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit');
    Route::put('/roles/{role}', [RoleController::class, 'update'])->name('roles.update');

    //permisos
    Route::get('/users/roles', [UserRoleController::class,'index'])->name('usuarios.roles.index');
    Route::put('/users/{user}/roles', [UserRoleController::class,'update'])->name('usuarios.roles.update');


    //usuarios
    Route::resource('users', UserController::class);

    // Registro habilitado solo para admin
   Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
   Route::post('/register', [RegisteredUserController::class, 'store']);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

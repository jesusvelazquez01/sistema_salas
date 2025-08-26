<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reserva;
use App\Models\Sala;
use App\Models\User;
use App\Models\Responsable;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class ReservaController extends Controller
{
    public function __construct()
    {
        date_default_timezone_set('America/Argentina/Buenos_Aires');
        $this->middleware('permission:ver Reserva')->only(['index', 'porSala']);
        $this->middleware('permission:crear Reserva')->only(['store']);
        $this->middleware('permission:editar Reserva')->only(['update']);
        $this->middleware('permission:eliminar Reserva')->only(['destroy']);
    }

    public function porSala(Sala $sala)
    {
        $reservas = $sala->reservas()->with('controlUso')->get()->map(function ($reserva) {
            $start = $reserva->fecha . 'T' . $reserva->hora_inicio;
            $end = $reserva->fecha . 'T' . $reserva->hora_fin;
            $fechaHora = $reserva->fecha . ' ' . $reserva->hora_fin;
            $esPasada = strtotime($fechaHora) < time();
            $tieneControl = $reserva->controlUso !== null;

            return [
                'id' => $reserva->id,
                'title' => 'Reserva de ' . $reserva->responsable,
                'start' => $start,
                'end' => $end,
                'entidad' => $reserva->entidad,
                'controlUso' => $reserva->controlUso,
                'esPasada' => $esPasada,
                'tieneControl' => $tieneControl,
                'estado' => $this->determinarEstado($reserva, $esPasada, $tieneControl),
                'puedeEditar' => Auth::id() === $reserva->user_id
            ];
        });

        return Inertia::render('reservas/CalendarioSalas', [
            'sala' => $sala,
            'reservas' => $reservas,
            'todasLasSalas' => Sala::select('id', 'nombre')->get(),
            'responsables' => Responsable::select('id', 'nombre', 'apellido', 'dni')->get(),
        ]);
    }

    public function index()
    {
        return Inertia::render('reservas/Reservas', [
            'reservas' => Reserva::with('sala')
                ->where('user_id', Auth::id())
                ->orderBy('fecha', 'desc')
                ->orderBy('hora_inicio', 'desc')
                ->paginate(10),
            'salas' => Sala::all(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'sala_id' => 'required|exists:salas,id',
            'entidad'=> 'required|string|max:255',
            'responsable' => 'required|string|max:255',
            'motivo' => 'nullable|string|max:500',
            'cantidad_equipos'=>'nullable|integer|min:0',
            'fecha' => 'required|date|after_or_equal:today',
            'hora_inicio' => 'required',
            'hora_fin' => 'required|after:hora_inicio',
        ]);

        // Validar que el responsable existe en la base de datos
        $responsableExiste = Responsable::whereRaw("CONCAT(nombre, ' ', apellido) = ?", [$request->responsable])->exists();
        if (!$responsableExiste) {
            return back()->withErrors(['responsable' => 'El responsable seleccionado no existe en el sistema.']);
        }

        // Validación de conflictos
        $existeConflicto = Reserva::where('sala_id', $request->sala_id)
            ->where('fecha', $request->fecha)
            ->where(function ($query) use ($request) {
                $query->where(function($q) use ($request) {
                    $q->where('hora_inicio', '<', $request->hora_inicio)
                      ->where('hora_fin', '>', $request->hora_inicio);
                })->orWhere(function($q) use ($request) {
                    $q->where('hora_inicio', '<', $request->hora_fin)
                      ->where('hora_fin', '>', $request->hora_fin);
                })->orWhere(function($q) use ($request) {
                    $q->where('hora_inicio', '>=', $request->hora_inicio)
                      ->where('hora_fin', '<=', $request->hora_fin);
                });
            })
            ->exists();

        if ($existeConflicto) {
            return back()->withErrors(['conflicto' => 'Ya existe una reserva en ese horario.']);
        }

        $reserva = Reserva::create([
            'sala_id' => $request->sala_id,
            'entidad' => $request->entidad,
            'responsable' => $request->responsable,
            'motivo' => $request->motivo,
            'cantidad_equipos' => $request->cantidad_equipos,
            'fecha' => $request->fecha,
            'hora_inicio' => $request->hora_inicio,
            'hora_fin' => $request->hora_fin,
            'user_id' => Auth::user()?->id,
        ]);

        // Enviar notificación al responsable vía N8N
        $this->enviarWebhookN8n($reserva, 'creada');

        return redirect()->back()->with('success', 'Reserva creada con éxito.');
    }

    public function update(Request $request, Reserva $reserva)
    {
        $request->validate([
            'sala_id' => 'required|exists:salas,id',
            'entidad'=> 'required|string|max:255',
            'responsable' => 'required|string|max:255',
            'motivo' => 'nullable|string|max:500',
            'cantidad_equipos'=>'nullable|integer|min:0',
            'fecha' => 'required|date|after_or_equal:today',
            'hora_inicio' => 'required',
            'hora_fin' => 'required|after:hora_inicio',
        ]);

        // Validar que el responsable existe en la base de datos
        $responsableExiste = Responsable::whereRaw("CONCAT(nombre, ' ', apellido) = ?", [$request->responsable])->exists();
        if (!$responsableExiste) {
            return back()->withErrors(['responsable' => 'El responsable seleccionado no existe en el sistema.']);
        }

        // Validación de conflictos excluyendo la reserva actual
        $conflicto = Reserva::where('sala_id', $request->sala_id)
            ->where('fecha', $request->fecha)
            ->where('id', '!=', $reserva->id)
            ->where(function ($query) use ($request) {
                $query->where(function($q) use ($request) {
                    $q->where('hora_inicio', '<', $request->hora_inicio)
                      ->where('hora_fin', '>', $request->hora_inicio);
                })->orWhere(function($q) use ($request) {
                    $q->where('hora_inicio', '<', $request->hora_fin)
                      ->where('hora_fin', '>', $request->hora_fin);
                })->orWhere(function($q) use ($request) {
                    $q->where('hora_inicio', '>=', $request->hora_inicio)
                      ->where('hora_fin', '<=', $request->hora_fin);
                });
            })
            ->exists();

        if ($conflicto) {
            return back()->withErrors(['conflicto' => 'Ya existe una reserva en ese horario.']);
        }

        $reserva->update($request->all());

        // Enviar notificación al responsable vía N8N
        $this->enviarWebhookN8n($reserva, 'actualizada');

        return redirect()->back()->with('success', 'Reserva actualizada con éxito.');
    }

    public function destroy(Reserva $reserva)
    {
        // Enviar notificación antes de eliminar
        $this->enviarWebhookN8n($reserva, 'cancelada');
        
        $reserva->delete();

        return redirect()->back()->with('success', 'Reserva eliminada.');
    }

    private function determinarEstado($reserva, $esPasada, $tieneControl)
    {
        if (!$esPasada) {
            return 'futura';
        }
        
        $fechaReserva = strtotime($reserva->fecha);
        $hace30Dias = strtotime('-30 days');
        
        if ($fechaReserva < $hace30Dias) {
            return 'muy_antigua';
        }
        
        return $tieneControl ? 'pasada_con_control' : 'pasada_sin_control';
    }

    private function enviarWebhookN8n($reserva, $accion)
    {
        try {
            $sala = $reserva->sala ?? Sala::find($reserva->sala_id);
            
            // Obtener datos del responsable de la reserva
            $responsable = Responsable::whereRaw("CONCAT(nombre, ' ', apellido) = ?", [$reserva->responsable])->first();
            
            // Datos del usuario que creó la reserva (para auditoría)
            $usuario = $reserva->user_id ? User::find($reserva->user_id) : Auth::user();
            
            Http::timeout(5)->post('https://n8n.srv912594.hstgr.cloud/webhook/reserva-evento', [
                'accion' => $accion, // 'creada', 'actualizada', 'cancelada'
                'reserva_id' => $reserva->id,
                'responsable' => $reserva->responsable,
                'entidad' => $reserva->entidad,
                'motivo' => $reserva->motivo,
                'sala_nombre' => $sala->nombre,
                'fecha' => $reserva->fecha,
                'hora_inicio' => $reserva->hora_inicio,
                'hora_fin' => $reserva->hora_fin,
                // Datos del responsable (quien recibe la notificación)
                'responsable_email' => $responsable->correo ?? null,
                'responsable_telefono' => $responsable->telefono ?? null,
                'responsable_dni' => $responsable->dni ?? null,
                // Datos del usuario creador (para auditoría)
                'usuario_creador' => $usuario->name ?? null,
                'usuario_email' => $usuario->email ?? null,
            ]);
        } catch (\Exception $e) {
            
        }
    }















}
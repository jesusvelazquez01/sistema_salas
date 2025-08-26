<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ControlUso extends Model
{
    use HasFactory;

    protected $fillable = [
        'reserva_id',
        'fue_utilizada',
        'observaciones',
    ];

    public function reserva()
    {
        return $this->belongsTo(Reserva::class);
    }
    
    public function equipos()
    {
        return $this->belongsToMany(Equipo::class, 'control_uso_equipos')
                    ->withPivot('estado_pantalla', 'estado', 'se_encendio', 'se_apago', 'se_conecto_a_cargar', 'nivel_bateria', 'observaciones')
                    ->withTimestamps();
    }
}
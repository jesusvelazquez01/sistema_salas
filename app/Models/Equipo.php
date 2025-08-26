<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Equipo extends Model
{
    use HasFactory;
    protected $fillable = [
        'marca',
        'modelo',
        'estado_inicial',
        'sistema_operativo',
        'fecha_adquisicion',
        'fecha_baja',
        'sala_id'
    ];

    public function sala()
    {
        return $this->belongsTo(Sala::class);
    }

    public function controlesUso()
    {
        return $this->belongsToMany(ControlUso::class, 'control_uso_equipos')
                    ->withPivot('estado_pantalla', 'estado', 'se_encendio', 'se_apago', 'se_conecto_a_cargar', 'nivel_bateria', 'observaciones')
                    ->withTimestamps();
    }
}
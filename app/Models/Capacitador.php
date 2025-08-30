<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Capacitador extends Model
{
    use HasFactory;
    protected $fillable=[
        'nombre',
        'apellido',
        'dni',
        'telefono',
        'correo'
    ];

    public function reservas()
    {
        return $this->belongsToMany(Reserva::class, 'capacitador_reserva');
    }
}

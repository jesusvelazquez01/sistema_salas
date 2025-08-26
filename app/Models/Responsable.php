<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Responsable extends Model
{
    use HasFactory;
    protected $fillable=[
        'nombre',
        'apellido',
        'dni',
        'telefono',
        'correo',
        'area',
        'reserva_id'
    ];
    public function reserva()
    {
        return $this->hasMany(Reserva::class);
    }
}

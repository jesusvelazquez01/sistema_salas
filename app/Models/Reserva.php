<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Reserva extends Model
{
    use HasFactory;

    protected $fillable = [
        'sala_id',
        'entidad',
        'responsable',
        'motivo',
        'fecha',
        'cantidad_equipos',
        'hora_inicio',
        'hora_fin',
        'user_id',
        'responsable_id'
    ];

    public function sala()
    {
        return $this->belongsTo(Sala::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function controlUso()
    {
        return $this->hasOne(ControlUso::class);
    }
    
    public function responsable(){
    return $this->belongsTo(Responsable::class);

}



}
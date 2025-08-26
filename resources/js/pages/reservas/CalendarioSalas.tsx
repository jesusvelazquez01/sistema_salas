import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DateSelectArg, EventClickArg } from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';
import {Undo2 } from 'lucide-react';
import React, { useState } from 'react';
import ReactModal from 'react-modal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ResponsableAutocomplete } from '@/components/ui/responsable-autocomplete';
import { type Sala, type Responsable, type Reserva, type PageProps } from '@/types';

ReactModal.setAppElement('#app');

type ReservaCalendario = Reserva & {
  title: string;
  start: string;
  end: string;
  controlUso?: unknown;
  esPasada?: boolean;
  tieneControl?: boolean;
  estado?: 'futura' | 'pasada_sin_control' | 'pasada_con_control' | 'muy_antigua';
  puedeEditar?: boolean;
};

interface Props extends PageProps {
  sala: Sala;
  reservas: ReservaCalendario[];
  todasLasSalas: Sala[];
  responsables: Responsable[];
  errors?: Record<string, string>;
  flash?: {
    success?: string;
  };
}

function esReservaPasada(fecha: string) {
  return new Date(fecha) < new Date(new Date().toISOString().split('T')[0]);
}

export default function CalendarioSala({ sala, reservas, todasLasSalas, responsables, flash, errors }: Props) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [nuevoTurno, setNuevoTurno] = useState({
    id: null as number | null,
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    responsable: '',
    entidad: '',
    motivo: '',
    cantidad_equipos: 0,
    tieneControl: false,
    puedeEditar: true,
  });



const getEventColor = (reserva: ReservaCalendario) => {
    switch(reserva.estado) {
        case 'futura': return '#eb7f34';
        case 'pasada_sin_control': return 'rgba(239, 68, 68, 0.6)';
        case 'pasada_con_control': return '#10b981';
        case 'muy_antigua': return 'rgba(156, 163, 175, 0.4)';
        default: return '#eb7f34';
    }
};

const getTextColor = (reserva: ReservaCalendario) => {
    return reserva.esPasada ? '#666666' : '#ffffff';
};

  const handleSelect = (info: DateSelectArg) => {
    const fechaSeleccionada = new Date(info.start);
    const ahora = new Date();
    
    // Bloquear selección de horarios pasados
    if (fechaSeleccionada < ahora) {
      toast.warning("No puedes reservar en horarios pasados", {
        position: "top-right",
        autoClose: 3000
      });
      return;
    }

    const fecha = info.startStr.split('T')[0];
    const hora_inicio = info.startStr.split('T')[1].substring(0, 5);
    const hora_fin = info.endStr.split('T')[1].substring(0, 5);

    setNuevoTurno({
      id: null,
      fecha,
      hora_inicio,
      hora_fin,
      responsable: '',
      entidad: '',
      motivo: '',
      cantidad_equipos: 0,
      tieneControl: false,
      puedeEditar: true
    });

    setModoEdicion(false);
    setModalAbierto(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const evento = clickInfo.event;
    const fecha = evento.startStr.split('T')[0];
    const hora_inicio = evento.startStr.split('T')[1].substring(0, 5);
    const hora_fin = evento.endStr.split('T')[1].substring(0, 5);
    const reserva = reservas.find(r => r.id.toString() === evento.id);

    if (!reserva) {
      toast.error("No se pudo encontrar la información de la reserva");
      return;
    }

    // Extraer el nombre del responsable del título
    const responsable = evento.title.replace('Reserva de ', '');

    setNuevoTurno({
      id: parseInt(evento.id),
      fecha,
      hora_inicio,
      hora_fin,
      responsable: responsable,
      entidad: reserva.entidad ?? '',
      motivo: reserva.motivo ?? '',
      cantidad_equipos: reserva.cantidad_equipos ?? 0,
      tieneControl: !!reserva.controlUso,
      puedeEditar: reserva.puedeEditar ?? false,
    });

    setModoEdicion(true);
    setModalAbierto(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mostrar toast de loading
    toast.loading("Procesando reserva...", {
      position: "top-right",
      toastId: 'reserva-loading'
    });
    
    if (modoEdicion && nuevoTurno.id) {
      router.put(`/reservas/${nuevoTurno.id}`, {
        ...nuevoTurno,
        sala_id: sala.id,
      }, {
        preserveScroll: true,
        onSuccess: () => {
          toast.dismiss('reserva-loading');
          toast.success("Reserva actualizada! Te enviaremos un email con los datos.", {
            position: "top-right",
            autoClose: 8000
          });
          // Retraso antes de recargar para que la notificación sea visible
          setTimeout(() => {
            router.reload({ only: ['reservas'] });
          }, 3000);
        },
        onError: (errors) => {
          toast.dismiss('reserva-loading');
          if (errors.conflicto) {
            toast.warning("Ya existe una reserva en ese horario", {
              position: "top-right",
              autoClose: 6000
            });
          } else {
            toast.error(" Error actualizando la reserva", {
              position: "top-right",
              autoClose: 6000
            });
          }
        }
      });
    } else {
      router.post('/reservas', {
        ...nuevoTurno,
        sala_id: sala.id,
      }, {
        preserveScroll: true,
        onSuccess: () => {
          toast.dismiss('reserva-loading');
          toast.success("¡Reserva confirmada! Te enviaremos un email con los datos.", {
            position: "top-right",
            autoClose: 3000
          });
          // Retraso antes de recargar para que la notificación sea visible
          setTimeout(() => {
            router.visit(`/salas/${sala.id}/reservas`, {
              preserveScroll: true,
              preserveState: false
            });
          }, 3000);
        },
        onError: (errors) => {
          toast.dismiss('reserva-loading');
          if (errors.conflicto) {
            toast.warning("Ya existe una reserva en ese horario", {
              position: "top-right",
              autoClose: 6000
            });
          } else {
            toast.error("Error creando la reserva", {
              position: "top-right",
              autoClose: 6000
            });
          }
        }
      });
    }
    setModalAbierto(false);
  };

  return (
    <AppLayout>
      <Head title={`Reservas - ${sala.nombre}`} />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Calendario de {sala.nombre}</h1>

        <div className="mb-4 flex items-center gap-3">
          <label htmlFor="select-sala" className="font-semibold text-gray-700">
            Cambiar sala:
          </label>
          <select
            id="select-sala"
            className="border rounded px-3 py-2"
            value={sala.id}
            onChange={(e) => {
              const nuevaSalaId = e.target.value;
              router.visit(`/salas/${nuevaSalaId}/reservas`);
            }}
          >
            {todasLasSalas.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
          
        </div>
        <div className="mb-4 flex items-center gap-3">
              <label className="text-sm text-gray-500">
                <a href="/dashboard" className="font-semibold text-gray-700 inline-flex items-center">
                  <Undo2 className="mr-1 h-4 w-4" /> 
                  Ir al dashboard
                </a>
              </label>
          </div>
          
          {/* Leyenda de colores */}
          <div className="mb-4 bg-gray-50 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Validaciones:</h3>
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{backgroundColor: '#eb7f34'}}></div>
                <span>Futuras</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{backgroundColor: 'rgba(239, 68, 68, 0.6)'}}></div>
                <span>Pasadas sin control</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{backgroundColor: '#10b981'}}></div>
                <span>Pasadas con control</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{backgroundColor: 'rgba(156, 163, 175, 0.4)'}}></div>
                <span>Muy antiguas</span>
              </div>
            </div>
          </div>
        <div className="bg-white rounded-xl shadow p-4">
                      {flash?.success && (
              <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded mb-4">
              {flash.success}
              </div>
            )}

          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            selectable={true}
            selectMirror={true}
            unselectAuto={false}
            select={handleSelect}
            eventClick={handleEventClick}
            initialView="timeGridWeek"
            locale={esLocale} 
            slotMinTime="08:00:00"
            slotMaxTime="22:00:00"
            slotDuration="00:30:00"
            nowIndicator={true}
            allDaySlot={false}
            height="auto"
            events={reservas.map((reserva) => ({
                ...reserva,
                id: reserva.id.toString(),
                backgroundColor: getEventColor(reserva),
                borderColor: getEventColor(reserva),
                textColor: getTextColor(reserva)
            }))}
            eventColor="#eb7f34"
            eventTextColor="#ffffff"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            titleFormat={{
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }}
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }}
          />
        </div>
      </div>

      <ReactModal
        isOpen={modalAbierto}
        onRequestClose={() => setModalAbierto(false)}
        className="bg-white p-6 rounded-lg max-w-md mx-auto mt-20 shadow-xl outline-none"
        overlayClassName="fixed inset-0 bg-[#183350]/50 backdrop-blur-sm flex items-start justify-center z-50"
      >
        <h2 className="text-xl font-bold mb-4">
          {modoEdicion ? 'Editar reserva' : 'Nueva reserva'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-medium">Entidad</label>
            <select
              className="w-full border rounded p-2"
              required
              value={nuevoTurno.entidad}
              disabled={modoEdicion && !nuevoTurno.puedeEditar}
              onChange={(e) =>
                setNuevoTurno({ ...nuevoTurno, entidad: e.target.value })
              }
              
            >
              {/* Opción por defecto deshabilitada */}
        <option value="" disabled>Selecciona una entidad</option>

        <optgroup label="Economía y Gestión">
            <option value="RLM Economia Popular">R.L.M. Economía Popular</option>
        </optgroup>
        <optgroup label="Hospitales y Servicios de Salud">
        <option value="Hospital Dr Guillermo C. Paterson">Hospital "Dr. Guillermo C. Paterson"</option>
        <option value="Hospital San Roque - Dirección Administrativa">Hospital San Roque - Dirección Administrativa</option>
        <option value="Hospital Nestor Sequeiros - Centro de Rehabilitacion">Hospital Nestor Sequeiros - Centro de Rehabilitacion</option>
        <option value="C.E.P.A.M">C.E.P.A.M</option>
        </optgroup>

        <optgroup label="Direcciones">
            <option value="Dirección General de Auditoría">Dirección General de Auditoría</option>
            <option value="Dirección Salud Digital">Dirección Salud Digital</option>
            <option value="Dirección Provincial de Rehabilitación">Dirección Provincial de Rehabilitación</option>
            <option value="Dirección Provincial Extra Hospitalaria">Dirección Provincial Extra Hospitalaria</option>
            <option value="Dirección Provincial de Odontología">Dirección Provincial de Odontología</option>
            <option value="Direccion General de A.P.S -FACTURACION">Direccion General de A.P.S -FACTURACION</option>
            <option value="Direccion Provincial de Hospitales">Direccion Provincial de Hospitales</option>
            
        </optgroup>
        <optgroup label="Departamentos">
            <option value="Departamento Provincial de Enfermería">Departamento Provincial de Enfermería</option>
            <option value="Departamento de Trabajo Social y Dirección General de Asuntos Institucionales del M.S.">Departamento de Trabajo Social y Dirección General de Asuntos Institucionales del M.S.</option>
            <option value="Departamento de Nutricion -Salud">Departamento de Nutricion -Salud</option>
        </optgroup>
        <optgroup label="Secretarias y subsecretarias">
        <option value="Secretaría de Salud Mental y Adicciones Central">Secretaría de Salud Mental y Adicciones Central</option>
        <option value="Subsecretaría de Prevención y Departamento Laboratorio">Subsecretaría de Prevención y Departamento Laboratorio</option>
        </optgroup>
        <optgroup label="Unidades y Programas">
            <option value="Sunibrom - Unidad de Programas">Sunibrom - Unidad de Programas</option>
            <option value="Unidad de Fiscalización de Establecimiento de Salud UFES">Unidad de Fiscalización de Establecimientos de Salud UFES</option>
        </optgroup>
        <optgroup label="Otros">
            <option value="Otros">Otros</option>
        </optgroup>
    </select>
          </div>
          <div className="mb-4">
            <label className="block font-medium">Responsable</label>
            {modoEdicion && !nuevoTurno.puedeEditar ? (
              <input
                type="text"
                className="w-full border rounded p-2 bg-gray-100"
                value={nuevoTurno.responsable}
                disabled
              />
            ) : (
              <ResponsableAutocomplete
                value={nuevoTurno.responsable}
                onChange={(value) => setNuevoTurno({ ...nuevoTurno, responsable: value })}
                responsables={responsables}
                placeholder="Buscar responsable por nombre o DNI..."
              />
            )}
            {errors?.responsable && (
              <p className="text-red-500 text-sm mt-1">{errors.responsable}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block font-medium">Motivo (opcional)</label>
            <textarea
              className="w-full border rounded p-2"
              rows={3}
              value={nuevoTurno.motivo}
              disabled={modoEdicion && !nuevoTurno.puedeEditar}
              onChange={(e) =>
                setNuevoTurno({ ...nuevoTurno, motivo: e.target.value })
              }
              placeholder="Describe el motivo de la reserva..."
            />
          </div>
          
          <div className="mb-4">
            <label className="block font-medium">Cantidad de Equipos</label>
            <input
              type="number"
              min="0"
              className="w-full border rounded p-2"
              value={nuevoTurno.cantidad_equipos}
              disabled={modoEdicion && !nuevoTurno.puedeEditar}
              onChange={(e) =>
                setNuevoTurno({ ...nuevoTurno, cantidad_equipos: parseInt(e.target.value) || 0 })
              }
              placeholder="0"
            />
          </div>
          

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-700">Fecha</label>
              <input
                type="text"
                className="w-full border rounded p-2 bg-gray-100"
                value={nuevoTurno.fecha}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Hora Inicio</label>
              <input
                type="text"
                className="w-full border rounded p-2 bg-gray-100"
                value={nuevoTurno.hora_inicio}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Hora Fin</label>
              <input
                type="text"
                className="w-full border rounded p-2 bg-gray-100"
                value={nuevoTurno.hora_fin}
                disabled
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            {modoEdicion && nuevoTurno.id && nuevoTurno.puedeEditar && esReservaPasada(nuevoTurno.fecha) && !nuevoTurno.tieneControl && (
              <button
                type="button"
                 onClick={() => router.visit('/control-uso')}
                   className="px-4 py-2 rounded bg-blue-700 text-white hover:bg-blue-800"
                  >
                Registrar uso
              </button>

            )}

            {modoEdicion && nuevoTurno.id && nuevoTurno.puedeEditar && !esReservaPasada(nuevoTurno.fecha) && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('¿Estás seguro de que querés cancelar esta reserva?')) {
                    router.delete(`/reservas/${nuevoTurno.id}`, {
                      preserveScroll: true,
                      onSuccess: () => {
                        toast.success('Reserva cancelada exitosamente', {
                          position: "top-right",
                          autoClose: 8000
                        });
                        // Retraso antes de recargar para que la notificación sea visible
                        setTimeout(() => {
                          router.reload({ only: ['reservas'] });
                        }, 3000);
                      }
                    });
                    setModalAbierto(false);
                  }
                }}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Cancelar reserva
              </button>
            )}

            <button
              type="button"
              onClick={() => setModalAbierto(false)}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            >
              Cerrar
            </button>
            {(!modoEdicion || (nuevoTurno.puedeEditar && !esReservaPasada(nuevoTurno.fecha))) && (
              <button
                type="submit"
                className="px-4 py-2 rounded bg-[#eb7f34] text-white hover:bg-orange-600"
              >
                Guardar
              </button>
            )}
          </div>
          
        </form>
      </ReactModal>
      
      <ToastContainer
        position="top-right"
        autoClose={8000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastStyle={{
          backgroundColor: '#ffffff',
          color: '#374151',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}
      />
    </AppLayout>
  );
}


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
import { type Sala, type Responsable, type Reserva, type PageProps, type Capacitador } from '@/types';

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
  capacitadores: Capacitador[];
  errors?: Record<string, string>;
  flash?: {
    success?: string;
  };
}

function esReservaPasada(fecha: string) {
  return new Date(fecha) < new Date(new Date().toISOString().split('T')[0]);
}

export default function CalendarioSala({ sala, reservas, todasLasSalas, responsables, capacitadores, flash, errors }: Props) {
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

  const [capacitadoresSeleccionados, setCapacitadoresSeleccionados] = useState<number[]>([]);



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

    setCapacitadoresSeleccionados([]);

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

    console.log('Reserva encontrada:', reserva); // Para debugging

    setNuevoTurno({
      id: reserva.id,
      fecha,
      hora_inicio,
      hora_fin,
      responsable: reserva.responsable || '',
      entidad: reserva.entidad || '',
      motivo: reserva.motivo || '',
      cantidad_equipos: reserva.cantidad_equipos || 0,
      tieneControl: !!reserva.controlUso,
      puedeEditar: reserva.puedeEditar ?? true,
    });

    // Cargar capacitadores existentes si los hay
    setCapacitadoresSeleccionados(reserva.capacitadores?.map(c => c.id) || []);

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
        capacitadores_ids: capacitadoresSeleccionados,
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
        capacitadores_ids: capacitadoresSeleccionados,
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
        className="bg-white p-6 rounded-lg max-w-2xl mx-auto mt-10 shadow-xl outline-none max-h-[90vh] overflow-y-auto"
        overlayClassName="fixed inset-0 bg-[#183350]/50 backdrop-blur-sm flex items-start justify-center z-50"
      >
        <h2 className="text-xl font-bold mb-4">
          {modoEdicion ? 'Editar reserva' : 'Nueva reserva'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-medium">Area</label>
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
        <option value="" disabled>Selecciona una Area</option>

        <optgroup label="Ministerio">
            <option value="Ministra de Planificacion Estrategica y Modernización">Ministra de Planificacion Estrategica y Modernización</option>
        </optgroup>
        <optgroup label="Secretaria de Planeamiento Estratégico">
        <option value="Dirección de Planeamiento Estratégico">Dirección de Planeamiento Estratégico"</option>
        <option value="Dirección de Gobernanza Publica">Dirección de Gobernanza Publica</option>
        <option value="Jefatura de Área de Políticas Públicas">Jefatura de Área de Políticas Públicas</option>
        </optgroup>
        <optgroup label="Secretaria de Innovación Pública">
            <option value="Dirección de Gobierno Digital">Dirección de Gobierno Digital</option>
            <option value="Dirección de Modernización de Gestión">Dirección de Modernización de Gestión</option>
            <option value="Dirección de Ciberseguridad">Dirección de Ciberseguridad</option>
            <option value="Dirección de Infraestructura de Conectividad y Comunicación">Dirección de Infraestructura de Conectividad y Comunicación</option>
            <option value="Dirección de Servicios Informáticos">Dirección de Servicios Informáticos</option>
            <option value="Jefatura de Área de Firma Digital y Documentación Electrónica">Jefatura de Área de Firma Digital y Documentación Electrónica</option>
            <option value="Direccion Provincial de Hospitales">Direccion Provincial de Hospitales</option>

        </optgroup>
        <optgroup label="Secretaria de Política Territorial Estratégica">
            <option value="Coordinación Territorial Estratégico">Departamento Provincial de Enfermería</option>
        </optgroup>
        <optgroup label="Dirección General de Administración">
        <option value="Jefatura del Área de Recursos Humanos">Jefatura del Área de Recursos Humanos</option>
        <option value="Jefatura del Área de Gestión Presupuestaria">Jefatura del Área de Gestión Presupuestaria</option>
        </optgroup>
        <optgroup label="Dirección Legal y Técnico">
            <option value="Jefatura de Despacho">Jefatura de Despacho</option>
        </optgroup>
        <optgroup label="Coordinaciones y demas Jefaturas">
            <option value="Otros">Coordinación de la Unidad Ejecutora Provincial de Transformación</option>
            <option value="Otros">Coordinación de Infraestructura de Datos Espaciales</option>
            <option value="Otros">Jefatura de Área de Gestión y Control</option>
            <option value="Otros">Jefatura de Área de Comunicaciones</option>
            <option value="Otros">Jefatura de Área de Auditoria</option>
            <option value="Otros">Consejo de Planificación Estrategica de la Provincia de Jujuy</option>
        </optgroup>
    </select>
          </div>
          <div className="mb-4">
            <label className="block font-medium">Jefe de Área</label>
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
                placeholder="Buscar jefe por nombre o DNI..."
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

          {/* Sección de Capacitadores */}
          <div className="mb-4">
            <label className="block font-medium mb-2">Capacitadores</label>
            <div className="max-h-40 overflow-y-auto border rounded p-2 bg-gray-50">
              {capacitadores.map((capacitador) => (
                <div key={capacitador.id} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
                  <input
                    type="checkbox"
                    id={`capacitador-${capacitador.id}`}
                    checked={capacitadoresSeleccionados.includes(capacitador.id)}
                    disabled={modoEdicion && !nuevoTurno.puedeEditar}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCapacitadoresSeleccionados([...capacitadoresSeleccionados, capacitador.id]);
                      } else {
                        setCapacitadoresSeleccionados(capacitadoresSeleccionados.filter(id => id !== capacitador.id));
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <label htmlFor={`capacitador-${capacitador.id}`} className="text-sm cursor-pointer flex-1">
                    {capacitador.nombre} {capacitador.apellido} - DNI: {capacitador.dni}
                  </label>
                </div>
              ))}
              {capacitadores.length === 0 && (
                <p className="text-gray-500 text-sm p-2">No hay capacitadores registrados</p>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Seleccionados: {capacitadoresSeleccionados.length}
            </p>
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


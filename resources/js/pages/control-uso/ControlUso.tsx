import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Save, X, Pencil } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { type BreadcrumbItem, type Reserva, type Equipo, type ControlUso } from '@/types';

interface Props {
  reservas: Reserva[];
  equipos: Equipo[];
  controles: ControlUso[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Control de Uso', href: '/control-uso' },
];

type EquipoSeleccionado = {
  equipo_id: number;
  estado_pantalla: string;
  estado_final: string;
  se_encendio: boolean;
  se_apago: boolean;
  se_conecto_a_cargar: boolean;
  nivel_bateria: number;
  observaciones_equipo: string;
};

export default function ControlUsoPage({ reservas, equipos, controles }: Props) {
  const [editing, setEditing] = useState<ControlUso | null>(null);
  const [equiposSeleccionados, setEquiposSeleccionados] = useState<EquipoSeleccionado[]>([]);

  const { data, setData, post, put, processing, reset } = useForm<{
    reserva_id: string;
    fue_utilizada: boolean;
    observaciones: string;
    equipos: EquipoSeleccionado[];
  }>({
    reserva_id: '',
    fue_utilizada: false,
    observaciones: '',
    equipos: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Actualizar el estado del formulario con los equipos
    setData('equipos', equiposSeleccionados);
    
    if (editing) {
      put(route('control-uso.update', editing.id), {
        onSuccess: () => {
          reset();
          setEditing(null);
          setEquiposSeleccionados([]);
          toast.success('Control de uso actualizado correctamente');
        },
        onError: () => {
          toast.error('Error al actualizar el control de uso');
        },
      });
    } else {
      post(route('control-uso.store'), {
        onSuccess: () => {
          reset();
          setEquiposSeleccionados([]);
          toast.success('Control de uso registrado correctamente');
        },
        onError: () => {
          toast.error('Error al registrar el control de uso');
        },
      });
    }
  };

  const toggleEquipo = (equipo: Equipo) => {
    const existe = equiposSeleccionados.find(e => e.equipo_id === equipo.id);
    
    if (existe) {
      const nuevosEquipos = equiposSeleccionados.filter(e => e.equipo_id !== equipo.id);
      setEquiposSeleccionados(nuevosEquipos);
      setData('equipos', nuevosEquipos);
    } else {
      const nuevoEquipo = {
        equipo_id: equipo.id,
        estado_pantalla: '',
        estado_final: '',
        se_encendio: false,
        se_apago: false,
        se_conecto_a_cargar: false,
        nivel_bateria: 0,
        observaciones_equipo: ''
      };
      const nuevosEquipos = [...equiposSeleccionados, nuevoEquipo];
      setEquiposSeleccionados(nuevosEquipos);
      setData('equipos', nuevosEquipos);
    }
  };

  const updateEquipoData = (equipoId: number, field: keyof EquipoSeleccionado, value: string | boolean | number) => {
    const nuevosEquipos = equiposSeleccionados.map(e => 
      e.equipo_id === equipoId ? { ...e, [field]: value } : e
    );
    setEquiposSeleccionados(nuevosEquipos);
    setData('equipos', nuevosEquipos);
  };

  const getEquiposPorSala = () => {
    if (!data.reserva_id) return [];
    const reservaSeleccionada = reservas.find(r => r.id.toString() === data.reserva_id);
    return equipos.filter(e => e.sala_id === reservaSeleccionada?.sala?.id);
  };

  const cancelEdit = () => {
    setEditing(null);
    setEquiposSeleccionados([]);
    reset();
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Control de Uso" />
      <div className="p-3">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="col-span-full">
            <Label htmlFor="reserva_id">Reserva</Label>
            <select
              id="reserva_id"
              value={data.reserva_id}
              onChange={(e) => setData('reserva_id', e.target.value)}
              className="w-full border px-3 py-2 rounded-md dark:bg-[#1e1e1e]"
              disabled={editing !== null}
            >
              <option value="">Seleccione una reserva</option>
              {reservas.map((reserva) => {
                const capacitadores = reserva.capacitadores?.map(c => `${c.nombre} ${c.apellido}`).join(', ') || '';
                return (
                  <option key={reserva.id} value={reserva.id}>
                    {reserva.sala?.nombre ?? 'Sin sala'} - {reserva.fecha} ({reserva.hora_inicio} - {reserva.hora_fin})
                    {capacitadores && ` - Capacitadores: ${capacitadores}`}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="col-span-full flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.fue_utilizada}
              onChange={(e) => setData('fue_utilizada', e.target.checked)}
            />
            <Label>¿Fue utilizada correctamente?</Label>
          </div>

          <div className="col-span-full">
            <Label>Observaciones</Label>
            <textarea
              className="w-full border px-3 py-2 rounded-md dark:bg-[#1e1e1e]"
              value={data.observaciones}
              onChange={(e) => setData('observaciones', e.target.value)}
              placeholder="Ej: Se rompió una computadora, quedó sucia, etc."
            />
          </div>

          {/* Sección de Equipos */}
          {data.reserva_id && (
            <div className="col-span-full mt-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="text-lg font-semibold mb-4">Equipos Utilizados</h3>
              
              <div className="space-y-4">
                {getEquiposPorSala().map((equipo) => {
                  const isSelected = equiposSeleccionados.some(e => e.equipo_id === equipo.id);
                  const equipoData = equiposSeleccionados.find(e => e.equipo_id === equipo.id);
                  
                  return (
                    <div key={equipo.id} className="border rounded p-3 bg-white dark:bg-gray-700">
                      <div className="flex items-center gap-3 mb-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleEquipo(equipo)}
                          className="w-4 h-4"
                        />
                        <span className="font-medium">
                          {equipo.marca} {equipo.modelo}
                        </span>
                        <span className="text-sm text-gray-500">
                          (Estado actual: {equipo.estado_inicial})
                        </span>
                      </div>
                      
                      {isSelected && equipoData && (
                        <div className="ml-7 space-y-4">
                          {/* Estados */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Label className="text-sm">Estado Pantalla</Label>
                              <select
                                value={equipoData.estado_pantalla}
                                onChange={(e) => updateEquipoData(equipo.id, 'estado_pantalla', e.target.value)}
                                className="w-full border px-2 py-1 rounded text-sm dark:bg-[#1e1e1e]"
                              >
                                <option value="">Seleccionar...</option>
                                <option value="excelente">Excelente</option>
                                <option value="bueno">Bueno</option>
                                <option value="regular">Regular</option>
                                <option value="malo">Malo</option>
                              </select>
                            </div>
                            
                            <div>
                              <Label className="text-sm">Estado Final</Label>
                              <select
                                value={equipoData.estado_final}
                                onChange={(e) => updateEquipoData(equipo.id, 'estado_final', e.target.value)}
                                className="w-full border px-2 py-1 rounded text-sm dark:bg-[#1e1e1e]"
                              >
                                <option value="">Seleccionar...</option>
                                <option value="excelente">Excelente</option>
                                <option value="bueno">Bueno</option>
                                <option value="regular">Regular</option>
                                <option value="malo">Malo</option>
                              </select>
                            </div>
                          </div>

                          {/* Checkboxes */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={equipoData.se_encendio}
                                onChange={(e) => updateEquipoData(equipo.id, 'se_encendio', e.target.checked)}
                                className="w-4 h-4"
                              />
                              <Label className="text-sm">Se encendió</Label>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={equipoData.se_apago}
                                onChange={(e) => updateEquipoData(equipo.id, 'se_apago', e.target.checked)}
                                className="w-4 h-4"
                              />
                              <Label className="text-sm">Se apagó</Label>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={equipoData.se_conecto_a_cargar}
                                onChange={(e) => updateEquipoData(equipo.id, 'se_conecto_a_cargar', e.target.checked)}
                                className="w-4 h-4"
                              />
                              <Label className="text-sm">Se conectó a cargar</Label>
                            </div>
                            
                            <div>
                              <Label className="text-sm">Nivel Batería (%)</Label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={equipoData.nivel_bateria}
                                onChange={(e) => updateEquipoData(equipo.id, 'nivel_bateria', parseInt(e.target.value) || 0)}
                                className="w-full border px-2 py-1 rounded text-sm dark:bg-[#1e1e1e]"
                              />
                            </div>
                          </div>

                          {/* Observaciones */}
                          <div>
                            <Label className="text-sm">Observaciones del Equipo</Label>
                            <textarea
                              value={equipoData.observaciones_equipo}
                              onChange={(e) => updateEquipoData(equipo.id, 'observaciones_equipo', e.target.value)}
                              className="w-full border px-2 py-1 rounded text-sm dark:bg-[#1e1e1e]"
                              rows={2}
                              placeholder="Observaciones específicas de este equipo..."
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="col-span-full flex gap-2">
            <Button type="submit" disabled={processing}>
              {editing ? (
                <>
                  <Pencil className="mr-2 h-4 w-4" />
                  Actualizar
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Registrar
                </>
              )}
            </Button>
            {editing && (
              <Button type="button" onClick={cancelEdit} variant="secondary">
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
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
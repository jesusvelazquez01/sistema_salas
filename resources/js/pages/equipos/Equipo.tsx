import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Save, X, Pencil, Edit, Trash2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SimpleDataTable } from '@/components/ui/simple-data-table';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { type BreadcrumbItem, type Sala, type Equipo, PageProps } from '@/types';
import { toast, ToastContainer } from 'react-toastify';

interface Props {
    equipos: Equipo[];
    salas: Sala[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Gestion de Equipos',
        href: '/equipos',
    },
];

export default function Equipos({ equipos, salas }: Props) {
    const [editingEquipo, setEditingEquipo] = useState<Equipo | null>(null);
    const{auth}=usePage<PageProps>().props;
    
    const getEstadoColor = (estado: string) => {
        switch (estado?.toLowerCase()) {
            case 'excelente': return 'bg-green-100 text-green-800';
            case 'bueno': return 'bg-blue-100 text-blue-800';
            case 'regular': return 'bg-yellow-100 text-yellow-800';
            case 'malo': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const { data, setData, post, put, delete: destroy, reset, processing, errors } = useForm({
        marca: '',
        modelo: '',
        estado_inicial: '',
        sistema_operativo: '',
        fecha_adquisicion: '',
        fecha_baja: '',
        sala_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingEquipo) {
            put(route('equipos.update', editingEquipo.id), {
                onSuccess: () => {
                    reset();
                    setEditingEquipo(null);
                    toast.success('Equipo actualizado correctamente');
                },
                onError: () => {
                    toast.error('Error al actualizar el equipo');
                },
            });
        } else {
            post(route('equipos.store'), {
                onSuccess: () => {
                    reset();
                    toast.success('Equipo registrado correctamente');
                },
                onError: () => {
                    toast.error('Error al registrar el equipo');
                },
            });
        }
    };

    const startEdit = (equipo: Equipo) => {
        setEditingEquipo(equipo);
        setData({
            marca: equipo.marca,
            modelo: equipo.modelo,
            estado_inicial: equipo.estado_inicial,
            sistema_operativo: equipo.sistema_operativo,
            fecha_adquisicion: equipo.fecha_adquisicion,
            fecha_baja: equipo.fecha_baja || '',
            sala_id: equipo.sala_id.toString(),
        });
    };

    const cancelEdit = () => {
        setEditingEquipo(null);
        reset();
    };

    const handleDelete = (equipo: Equipo) => {
        destroy(route('equipos.destroy', equipo.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Equipo eliminado correctamente');
            },
            onError: () => {
                toast.error('Error al eliminar el equipo');
            },
        });
    };

    const columns: ColumnDef<Equipo>[] = [
        {
            accessorKey: 'marca',
            header: 'Marca',
        },
        {
            accessorKey: 'modelo',
            header: 'Modelo',
        },
        {
            accessorKey: 'estado_inicial',
            header: 'Estado',
            cell: ({ row }) => (
                <span className={`px-2 py-1 rounded text-xs font-medium ${getEstadoColor(row.original.estado_inicial)}`}>
                    {row.original.estado_inicial}
                </span>
            ),
        },
        {
            accessorKey: 'sistema_operativo',
            header: 'S.O.',
        },
        {
            accessorKey: 'fecha_adquisicion',
            header: 'F. Adquisición',
        },
        {
            accessorKey: 'fecha_baja',
            header: 'F. Baja',
            cell: ({ row }) => (
                <span className={row.original.fecha_baja ? 'text-red-600 font-medium' : ''}>
                    {row.original.fecha_baja || '-'}
                </span>
            ),
        },
        {
            accessorKey: 'sala.nombre',
            header: 'Sala',
        },
        {
            id: 'actions',
            header: 'Acciones',
            cell: ({ row }) => {
                const equipo = row.original;
                return (
                    <div className="flex gap-2">
                        <Button onClick={() => startEdit(equipo)} size="sm" variant="default">
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogTitle>¿Desea eliminar el equipo "{equipo.marca} {equipo.modelo}"?</DialogTitle>
                                <DialogDescription>
                                    Esta acción no se puede deshacer. El equipo será eliminado permanentemente del sistema.
                                </DialogDescription>
                                <DialogFooter className="gap-2">
                                    <DialogClose asChild>
                                        <Button variant="secondary">
                                            Cancelar
                                        </Button>
                                    </DialogClose>
                                    <DialogClose asChild>
                                        <Button 
                                            variant="destructive" 
                                            onClick={() => handleDelete(equipo)}
                                            disabled={processing}
                                        >
                                            Eliminar
                                        </Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Equipos" />

            <div className="p-3">
                {/* Formulario */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 border rounded-lg">
                    <div>
                        <Label>Marca</Label>
                        <Input
                            value={data.marca}
                            onChange={(e) => setData('marca', e.target.value)}
                            placeholder="HP, Dell, Lenovo..."
                        />
                        {errors.marca && <p className="text-sm text-red-500">{errors.marca}</p>}
                    </div>

                    <div>
                        <Label>Modelo</Label>
                        <Input
                            value={data.modelo}
                            onChange={(e) => setData('modelo', e.target.value)}
                            placeholder="Pavilion 15, Inspiron..."
                        />
                        {errors.modelo && <p className="text-sm text-red-500">{errors.modelo}</p>}
                    </div>

                    <div>
                        <Label>Estado Inicial</Label>
                        <Select value={data.estado_inicial} onValueChange={(value) => setData('estado_inicial', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="excelente">Excelente</SelectItem>
                                <SelectItem value="bueno">Bueno</SelectItem>
                                <SelectItem value="regular">Regular</SelectItem>
                                <SelectItem value="malo">Malo</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.estado_inicial && <p className="text-sm text-red-500">{errors.estado_inicial}</p>}
                    </div>

                    <div>
                        <Label>Sistema Operativo</Label>
                        <Input
                            value={data.sistema_operativo}
                            onChange={(e) => setData('sistema_operativo', e.target.value)}
                            placeholder="Windows 11, Ubuntu..."
                        />
                        {errors.sistema_operativo && <p className="text-sm text-red-500">{errors.sistema_operativo}</p>}
                    </div>

                    <div>
                        <Label>Fecha Adquisición</Label>
                        <Input
                            type="date"
                            value={data.fecha_adquisicion}
                            onChange={(e) => setData('fecha_adquisicion', e.target.value)}
                        />
                        {errors.fecha_adquisicion && <p className="text-sm text-red-500">{errors.fecha_adquisicion}</p>}
                    </div>

                    <div>
                        <Label>Fecha Baja (opcional)</Label>
                        <Input
                            type="date"
                            value={data.fecha_baja}
                            onChange={(e) => setData('fecha_baja', e.target.value)}
                        />
                        {errors.fecha_baja && <p className="text-sm text-red-500">{errors.fecha_baja}</p>}
                    </div>

                    <div>
                        <Label>Sala</Label>
                        <Select value={data.sala_id} onValueChange={(value) => setData('sala_id', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar sala..." />
                            </SelectTrigger>
                            <SelectContent>
                                {salas.map(sala => (
                                    <SelectItem key={sala.id} value={sala.id.toString()}>{sala.nombre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.sala_id && <p className="text-sm text-red-500">{errors.sala_id}</p>}
                    </div>

                    <div className="md:col-span-4 flex gap-2">
                        <Button type="submit" disabled={processing}>
                            {editingEquipo ? (
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
                        {editingEquipo && (
                            <Button type="button" onClick={cancelEdit} variant="secondary">
                                <X className="mr-2 h-4 w-4" />
                                Cancelar
                            </Button>
                        )}
                    </div>
                </form>

                {/* DataTable */}
                <SimpleDataTable columns={columns} data={equipos} />
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
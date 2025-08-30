import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Save, X, Pencil, Edit, Trash2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ResponsablesDataTable } from '@/components/ui/responsables-data-table';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { type BreadcrumbItem, type Capacitador, type PaginatedData } from '@/types';
import { router } from '@inertiajs/react';
import { toast, ToastContainer } from 'react-toastify';

interface Props {
    capacitadores: PaginatedData<Capacitador>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Gestión de Capacitadores',
        href: '/capacitadores',
    },
];

export default function Capacitadores({ capacitadores }: Props) {
    const [editingCapacitador, setEditingCapacitador] = useState<Capacitador | null>(null);

    const { data, setData, post, put, delete: destroy, reset, processing, errors } = useForm({
        nombre: '',
        apellido: '',
        dni: '',
        telefono: '',
        correo: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCapacitador) {
            put(route('capacitadores.update', editingCapacitador.id), {
                onSuccess: () => {
                    reset();
                    setEditingCapacitador(null);
                    toast.success('Capacitador actualizado correctamente');
                },
                onError: () => {
                    toast.error('Error al actualizar el capacitador');
                },
            });
        } else {
            post(route('capacitadores.store'), {
                onSuccess: () => {
                    reset();
                    toast.success('Capacitador registrado correctamente');
                },
                onError: () => {
                    toast.error('Error al registrar el capacitador');
                },
            });
        }
    };

    const startEdit = (capacitador: Capacitador) => {
        setEditingCapacitador(capacitador);
        setData({
            nombre: capacitador.nombre,
            apellido: capacitador.apellido,
            dni: capacitador.dni,
            telefono: capacitador.telefono,
            correo: capacitador.correo,
        });
    };

    const cancelEdit = () => {
        setEditingCapacitador(null);
        reset();
    };

    const handleDelete = (capacitador: Capacitador) => {
        destroy(route('capacitadores.destroy', capacitador.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Capacitador eliminado correctamente');
            },
            onError: () => {
                toast.error('Error al eliminar el capacitador');
            },
        });
    };

    const columns: ColumnDef<Capacitador>[] = [
        {
            accessorKey: 'nombre',
            header: 'Nombre',
        },
        {
            accessorKey: 'apellido',
            header: 'Apellido',
        },
        {
            accessorKey: 'dni',
            header: 'DNI',
        },
        {
            accessorKey: 'telefono',
            header: 'Teléfono',
        },
        {
            accessorKey: 'correo',
            header: 'Correo',
        },

        {
            id: 'actions',
            header: 'Acciones',
            cell: ({ row }) => {
                const capacitador = row.original;
                return (
                    <div className="flex gap-2">
                        <Button onClick={() => startEdit(capacitador)} size="sm" variant="default">
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogTitle>¿Desea eliminar el capacitador "{capacitador.nombre} {capacitador.apellido}"?</DialogTitle>
                                <DialogDescription>
                                    Esta acción no se puede deshacer. El capacitador será eliminado permanentemente del sistema.
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
                                            onClick={() => handleDelete(capacitador)}
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
            <Head title="Gestión de Capacitadores" />

            <div className="p-3">
                {/* Formulario */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 border rounded-lg">
                    <div>
                        <Label>Nombre</Label>
                        <Input
                            value={data.nombre}
                            onChange={(e) => setData('nombre', e.target.value)}
                            placeholder="Nombre del capacitador"
                        />
                        {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
                    </div>

                    <div>
                        <Label>Apellido</Label>
                        <Input
                            value={data.apellido}
                            onChange={(e) => setData('apellido', e.target.value)}
                            placeholder="Apellido del capacitador"
                        />
                        {errors.apellido && <p className="text-sm text-red-500">{errors.apellido}</p>}
                    </div>

                    <div>
                        <Label>DNI</Label>
                        <Input
                            value={data.dni}
                            onChange={(e) => setData('dni', e.target.value)}
                            placeholder="12345678"
                        />
                        {errors.dni && <p className="text-sm text-red-500">{errors.dni}</p>}
                    </div>

                    <div>
                        <Label>Teléfono</Label>
                        <Input
                            value={data.telefono}
                            onChange={(e) => setData('telefono', e.target.value)}
                            placeholder="388-1234567"
                        />
                        {errors.telefono && <p className="text-sm text-red-500">{errors.telefono}</p>}
                    </div>

                    <div>
                        <Label>Correo</Label>
                        <Input
                            type="email"
                            value={data.correo}
                            onChange={(e) => setData('correo', e.target.value)}
                            placeholder="correo@ejemplo.com"
                        />
                        {errors.correo && <p className="text-sm text-red-500">{errors.correo}</p>}
                    </div>



                    <div className="md:col-span-2 flex gap-2">
                        <Button type="submit" disabled={processing}>
                            {editingCapacitador ? (
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
                        {editingCapacitador && (
                            <Button type="button" onClick={cancelEdit} variant="secondary">
                                <X className="mr-2 h-4 w-4" />
                                Cancelar
                            </Button>
                        )}
                    </div>
                </form>

                {/* DataTable con paginación */}
                <ResponsablesDataTable 
                    columns={columns} 
                    data={capacitadores.data}
                    pagination={{
                        from: capacitadores.data.length > 0 ? ((capacitadores.current_page - 1) * capacitadores.per_page) + 1 : 0,
                        to: Math.min(capacitadores.current_page * capacitadores.per_page, capacitadores.total),
                        total: capacitadores.total,
                        links: capacitadores.links,
                        OnPageChange: (url: string | null) => {
                            if (url) {
                                router.get(url);
                            }
                        },
                    }}
                />
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
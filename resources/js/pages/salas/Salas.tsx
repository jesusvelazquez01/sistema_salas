import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Save, X, Pencil, Edit, Trash2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SimpleDataTable } from '@/components/ui/simple-data-table';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { type BreadcrumbItem, type Sala } from '@/types';
import { toast, ToastContainer } from 'react-toastify';

interface Props {
    salas: Sala[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Gestion de Salas',
        href: '/admin/salas',
    },
];

export default function Salas({ salas }: Props) {
    const [editingSala, setEditingSala] = useState<Sala | null>(null);

    const { data, setData, post, put, delete: destroy, reset, processing, errors } = useForm({
        nombre: '',
        capacidad: '',
        ubicacion: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSala) {
            put(route('salas.update', editingSala.id), {
                onSuccess: () => {
                    reset();
                    setEditingSala(null);
                    toast.success('Sala actualizada correctamente');
                },
                onError: () => {
                    toast.error('Error al actualizar la sala');
                },
            });
        } else {
            post(route('salas.store'), {
                onSuccess: () => {
                    reset();
                    toast.success('Sala registrada correctamente');
                },
                onError: () => {
                    toast.error('Error al registrar la sala');
                },
            });
        }
    };

    const startEdit = (sala: Sala) => {
        setEditingSala(sala);
        setData({
            nombre: sala.nombre,
            capacidad: sala.capacidad?.toString() || '',
            ubicacion: sala.ubicacion || '',
        });
    };

    const cancelEdit = () => {
        setEditingSala(null);
        reset();
    };

    const handleDelete = (sala: Sala) => {
        destroy(route('salas.destroy', sala.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Sala eliminada correctamente');
            },
            onError: () => {
                toast.error('Error al eliminar la sala');
            },
        });
    };

    const columns: ColumnDef<Sala>[] = [
        {
            accessorKey: 'nombre',
            header: 'Nombre',
        },
        {
            accessorKey: 'capacidad',
            header: 'Capacidad',
        },
        {
            accessorKey: 'ubicacion',
            header: 'Ubicación',
        },
        {
            id: 'actions',
            header: 'Acciones',
            cell: ({ row }) => {
                const sala = row.original;
                return (
                    <div className="flex gap-2">
                        <Button onClick={() => startEdit(sala)} size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogTitle>¿Desea eliminar la sala "{sala.nombre}"?</DialogTitle>
                                <DialogDescription>
                                    Esta acción no se puede deshacer. La sala será eliminada permanentemente del sistema junto con sus reservas.
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
                                            onClick={() => handleDelete(sala)}
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
            <Head title="Gestión de Salas" />

            <div className="">
                <h1 className="text-2xl font-bold mb-6">Gestión de Salas</h1>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 border rounded-lg">
                    <div>
                        <Label>Nombre</Label>
                        <Input
                            value={data.nombre}
                            onChange={(e) => setData('nombre', e.target.value)}
                            placeholder="Nombre de la sala"
                        />
                        {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
                    </div>

                    <div>
                        <Label>Capacidad</Label>
                        <Input
                            type="number"
                            value={data.capacidad}
                            onChange={(e) => setData('capacidad', e.target.value)}
                            placeholder="20"
                        />
                        {errors.capacidad && <p className="text-sm text-red-500">{errors.capacidad}</p>}
                    </div>

                    <div>
                        <Label>Ubicación</Label>
                        <Input
                            value={data.ubicacion}
                            onChange={(e) => setData('ubicacion', e.target.value)}
                            placeholder="Edificio B"
                        />
                        {errors.ubicacion && <p className="text-sm text-red-500">{errors.ubicacion}</p>}
                    </div>

                    <div className="md:col-span-3 flex gap-2">
                        <Button type="submit" disabled={processing}>
                            {editingSala ? (
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
                        {editingSala && (
                            <Button type="button" onClick={cancelEdit} variant="secondary">
                                <X className="mr-2 h-4 w-4" />
                                Cancelar
                            </Button>
                        )}
                    </div>
                </form>

                {/* DataTable */}
                <SimpleDataTable columns={columns} data={salas} />
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
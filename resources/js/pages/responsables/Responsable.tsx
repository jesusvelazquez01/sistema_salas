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
import { type BreadcrumbItem, type Responsable, type PaginatedData } from '@/types';
import { toast, ToastContainer } from 'react-toastify';
import { router } from '@inertiajs/react';

interface Props {
    responsables: PaginatedData<Responsable>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Gestion de Responsables',
        href: '/admin/responsables',
    },
];

export default function Responsables({ responsables }: Props) {
    const [editingResponsable, setEditingResponsable] = useState<Responsable | null>(null);

    const { data, setData, post, put, delete: destroy, reset, processing, errors } = useForm({
        nombre: '',
        apellido: '',
        dni: '',
        telefono: '',
        correo: '',
        area: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingResponsable) {
            put(route('responsables.update', editingResponsable.id), {
                onSuccess: () => {
                    reset();
                    setEditingResponsable(null);
                    toast.success('Responsable actualizado correctamente');
                },
                onError: () => {
                    toast.error('Error al actualizar el responsable');
                },
            });
        } else {
            post(route('responsables.store'), {
                onSuccess: () => {
                    reset();
                    toast.success('Responsable registrado correctamente');
                },
                onError: () => {
                    toast.error('Error al registrar al responsable');
                },
            });
        }
    };

    const startEdit = (responsable: Responsable) => {
        setEditingResponsable(responsable);
        setData({
            nombre: responsable.nombre,
            apellido: responsable.apellido,
            dni: responsable.dni || '',
            telefono: responsable.telefono || '',
            correo: responsable.correo || '',
            area: responsable.area || '',
        });
    };

    const cancelEdit = () => {
        setEditingResponsable(null);
        reset();
    };

    const handleDelete = (responsable: Responsable) => {
        destroy(route('responsables.destroy', responsable.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Responsable eliminado correctamente');
            },
            onError: () => {
                toast.error('Error al eliminar el Responsable');
            },
        });
    };

    const columns: ColumnDef<Responsable>[] = [
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
            header: 'D.N.I',
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
            accessorKey: 'area',
            header: 'Área',
        },
        {
            id: 'actions',
            header: 'Acciones',
            cell: ({ row }) => {
                const responsable = row.original;
                return (
                    <div className="flex gap-2">
                        <Button onClick={() => startEdit(responsable)} size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogTitle>¿Desea eliminar al Responsable "{responsable.nombre} {responsable.apellido}"?</DialogTitle>
                                <DialogDescription>
                                    Esta acción no se puede deshacer. El responsable será eliminado permanentemente del sistema.
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
                                            onClick={() => handleDelete(responsable)}
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
            <Head title="Gestión de Responsables" />

            <div className="">
                <h1 className="text-2xl font-bold mb-6">Gestión de Responsables</h1>



                {/* Formulario */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 border rounded-lg">
                    <div>
                        <Label>Nombre</Label>
                        <Input
                            value={data.nombre}
                            onChange={(e) => setData('nombre', e.target.value)}
                            placeholder="Nombre del responsable"
                        />
                        {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
                    </div>

                    <div>
                        <Label>Apellido</Label>
                        <Input
                            value={data.apellido}
                            onChange={(e) => setData('apellido', e.target.value)}
                            placeholder="Apellido del responsable"
                        />
                        {errors.apellido && <p className="text-sm text-red-500">{errors.apellido}</p>}
                    </div>

                    <div>
                        <Label>D.N.I</Label>
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

                    <div>
                        <Label>Área</Label>
                        <Input
                            value={data.area}
                            onChange={(e) => setData('area', e.target.value)}
                            placeholder="Sistemas, Administración..."
                        />
                        {errors.area && <p className="text-sm text-red-500">{errors.area}</p>}
                    </div>

                    <div className="md:col-span-3 flex gap-2">
                        <Button type="submit" disabled={processing}>
                            {editingResponsable ? (
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
                        {editingResponsable && (
                            <Button type="button" onClick={cancelEdit} variant="secondary">
                                <X className="mr-2 h-4 w-4" />
                                Cancelar
                            </Button>
                        )}
                    </div>
                </form>

                {/* DataTable con filtro integrado */}
                <ResponsablesDataTable 
                    columns={columns} 
                    data={responsables.data}
                    pagination={{
                        from: responsables.data.length > 0 ? ((responsables.current_page - 1) * responsables.per_page) + 1 : 0,
                        to: Math.min(responsables.current_page * responsables.per_page, responsables.total),
                        total: responsables.total,
                        links: responsables.links,
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
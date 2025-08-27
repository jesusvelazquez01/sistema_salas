import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { SimpleDataTable } from '@/components/ui/simple-data-table';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { type BreadcrumbItem, type PageProps, type UserWithRoles } from '@/types';
import { toast, ToastContainer } from 'react-toastify';
import { normalizePaginatedData } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Usuarios',
        href: '/users',
    },
];

export default function Index() {
    const { users } = usePage<PageProps>().props;
    const normalizedUsers = normalizePaginatedData<UserWithRoles>(users);

    const handleDelete = (user: UserWithRoles) => {
        router.post(route('users.destroy', user.id), {
            _method: 'delete',
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Usuario eliminado correctamente');
            },
            onError: () => {
                toast.error('Error al eliminar el usuario');
            },
        });
    };

    const columns: ColumnDef<UserWithRoles>[] = [
        {
            accessorKey: 'id',
            header: 'ID',
        },
        {
            accessorKey: 'name',
            header: 'Nombre',
        },
        {
            accessorKey: 'email',
            header: 'Correo',
        },
        {
            id: 'roles',
            header: 'Roles',
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1 text-xs">
                    {row.original.roles.map((role) => (
                        <span key={role.id} className="bg-muted rounded-md px-2 py-1">
                            {role.name}
                        </span>
                    ))}
                </div>
            ),
        },
        {
            id: 'actions',
            header: 'Acciones',
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="flex gap-2">
                        <Link href={route('users.edit', user.id)}>
                            <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogTitle>¿Desea eliminar el usuario "{user.name}"?</DialogTitle>
                                <DialogDescription>
                                    Esta acción no se puede deshacer. El usuario será eliminado permanentemente del sistema.
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
                                            onClick={() => handleDelete(user)}
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
            <Head title="Usuarios" />
            <div className="">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold"></h1>
                    <Link href={route('users.create')}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Agregar Usuario
                        </Button>
                    </Link>
                </div>

                <SimpleDataTable columns={columns} data={normalizedUsers.data} />
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

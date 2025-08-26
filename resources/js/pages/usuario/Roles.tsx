import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useCallback } from 'react';
import type { PageProps, Role, UserWithRoles, PaginatedData } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles de Usuario',
        href: '/users/roles',
    },
];
interface Props extends PageProps {
    usuarios: UserWithRoles[];
    roles: Role[];
}

export default function UserRolesPage({ usuarios, roles }: Props) {

    const initialRoles: Record<number, string> = {};
    usuarios.forEach((user) => {
        initialRoles[user.id] = user.roles?.[0]?.name || '';
    });

    const { data, setData, put, processing } = useForm<{ roles: Record<number, string> }>({
        roles: initialRoles,
    });

    const handleChange = (userId: number, role: string) => {
        setData('roles', {
            ...data.roles,
            [userId]: role,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Enviar actualizaciones para cada usuario que cambió
        Object.entries(data.roles).forEach(([userId, roleName]) => {
            const user = usuarios.find(u => u.id === parseInt(userId));
            const currentRole = user?.roles?.[0]?.name || '';
            
            // Solo actualizar si el rol cambió
            if (currentRole !== roleName && roleName) {
                router.put(`/users/${userId}/roles`, {
                    roles: [roleName]
                }, {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        console.log(`Rol actualizado para usuario ${userId}`);
                    },
                    onError: (errors) => {
                        console.error('Error actualizando rol:', errors);
                    }
                });
            }
        });
    };

    const handleCancel = () => {
        router.visit('/dashboard');
    };

    const columns = [
        {
            header: 'Nombre',
            accessorKey: 'name',
        },
        {
            header: 'Email',
            accessorKey: 'email',
        },
        {
            header: 'Rol',
            id: 'role',
            cell: ({ row }: { row: { original: UserWithRoles } }) => (
                <Select value={data.roles[row.original.id]} onValueChange={(value) => handleChange(row.original.id, value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                        {roles.map((role) => (
                            <SelectItem key={role.id} value={role.name}>
                                <span className="capitalize">{role.name}</span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ),
        },
    ];

    const handleSearch = useCallback((searchTerm: string) => {
        router.get(
            '/users/roles',
            { search: searchTerm },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['usuarios'],
            },
        );
    }, []);

    const handlePageChange = useCallback((url: string | null) => {
        if (url) {
            router.get(url, undefined, {
                preserveState: true,
                preserveScroll: true,
                only: ['users'],
            });
        }
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Asignar Roles" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-2xl font-bold">Asignar Roles a Usuarios</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardContent>
                            <DataTable
                                columns={columns}
                                data={usuarios}
                            />
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleCancel}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processing}>
                                Guardar
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}

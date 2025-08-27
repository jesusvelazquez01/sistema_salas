import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, PageProps, Role, PaginatedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus } from 'lucide-react';
import { useCallback } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Gestión de Roles',
        href: '/roles',
    },
];

interface Props extends PageProps {
    roles: PaginatedData<Role>;
}

export default function Index({ roles }: Props) {

    const columns: ColumnDef<Role>[] = [
        {
            header: 'Rol',
            accessorKey: 'name',
            cell: ({ row }) => (
                <span className="font-medium capitalize">{row.getValue('name')}</span>
            ),
        },
        {
            header: 'Permisos',
            accessorKey: 'permissions_count',
            cell: ({ row }) => (
                <span className="text-gray-600">{row.getValue('permissions_count')} permisos</span>
            ),
        },
        {
            header: 'Acciones',
            id: 'actions',
            cell: ({ row }) => (
                <Link href={`/roles/${row.original.id}/edit`}>
                    <Button size="sm" variant="default">
                        <Pencil className="h-4 w-4 mr-1" />
                    </Button>
                </Link>
            ),
        },
    ];

    const handleSearch = useCallback((searchTerm: string) => {
        router.get(
            '/roles',
            { search: searchTerm },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['roles'],
            },
        );
    }, []);

    const handlePageChange = useCallback((url: string | null) => {
        if (url) {
            router.get(url, undefined, {
                preserveState: true,
                preserveScroll: true,
                only: ['roles'],
            });
        }
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Roles" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    
                </div>
                <DataTable
                    columns={columns}
                    data={roles.data}
                    pagination={{
                        from: roles.from,
                        to: roles.to,
                        total: roles.total,
                        links: roles.links,
                        OnPageChange: handlePageChange,
                    }}
                />
            </div>
        </AppLayout>
    );
}
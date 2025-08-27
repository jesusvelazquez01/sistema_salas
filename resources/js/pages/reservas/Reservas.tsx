// resources/js/Pages/Reservas/Index.tsx

import AppLayout from '@/layouts/app-layout';
import { Head,router} from '@inertiajs/react';
import {ColumnDef} from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';

import { type BreadcrumbItem, type Reserva, type Sala, type PaginatedData } from '@/types';

interface Props {
    salas: Sala[];
    reservas: PaginatedData<Reserva>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Gestion de Reservas',
        href: '/reservas',
    },
];

const columns: ColumnDef<Reserva>[]=[
    {
        accessorKey:'sala.nombre',
        header: 'Sala',
    },
    {
        accessorKey:'entidad',
        header:'Entidad',
    },
    {
        accessorKey:'responsable',
        header:'Responsable',
    },
    {
        accessorKey:'fecha',
        header:'Fecha',
    },
    {
        accessorKey:'hora_inicio',
        header:'Hora Inicio',
    },
    {
        accessorKey:'hora_fin',
        header:'Hora Fin',
    },
    {
        accessorKey:'cantidad_equipos',
        header:'Cant. Equipos',
    }
];

export default function Reservas({ reservas }: Props) {
    const handlePageChange = (url: string | null) => {
        if (url) {
            router.get(url);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reservas" />
            <div className="max-w p-3">
                <h1 className="text-2xl font-bold mb-6">Visualizacion de Reservas</h1>
                <DataTable 
                    columns={columns} 
                    data={reservas.data}
                    pagination={{
                        from: reservas.data.length > 0 ? ((reservas.current_page - 1) * reservas.per_page) + 1 : 0,
                        to: Math.min(reservas.current_page * reservas.per_page, reservas.total),
                        total: reservas.total,
                        links: reservas.links,
                        OnPageChange: handlePageChange,
                    }}
                />
            </div>
        </AppLayout>
    );
}

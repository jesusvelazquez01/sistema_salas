

import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {ColumnDef} from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { type BreadcrumbItem, type Reserva, type Sala, type PaginatedData } from '@/types';

interface Props {
    salas: Sala[];
    reservas: PaginatedData<Reserva>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Gestion de Reservas usuarios',
        href: '/admin/reservas',
    },
];
const columns: ColumnDef<Reserva>[]=[
    {
        accessorKey:'sala.nombre',
        header: 'Sala',
    },
    {
        accessorKey:'entidad',
        header:'Área',
    },
    {
        accessorKey:'responsable',
        header:'Jefe de Área',
    },
    {
        accessorKey:'capacitadores',
        header:'Capacitadores',
        cell: ({ row }) => {
            const capacitadores = row.original.capacitadores?.map(c => `${c.nombre} ${c.apellido}`).join(', ') || 'Sin capacitadores';
            return (
                <div className="text-sm text-blue-600">
                    {capacitadores}
                </div>
            );
        },
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
    },
    {
        accessorKey:'motivo',
        header:'Motivo',
        cell: ({ row }) => (
            <div className="max-w-xs">
                {row.original.motivo ? (
                    <p className="text-sm text-gray-600 truncate" title={row.original.motivo}>
                        {row.original.motivo}
                    </p>
                ) : (
                    <span className="text-gray-400 text-sm">Sin motivo</span>
                )}
            </div>
        ),
    }
];
export default function ReservasAdmin({ reservas}: Props) {
    
    const handlePageChange=(url:string | null) =>{
        if(url){
            router.get(url);
        }
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reservas" />
            <div className="p-3">
            
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
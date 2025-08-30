import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';

import { type BreadcrumbItem, type PaginatedData } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

interface HistorialItem {
    id: number;
    marca: string;
    modelo: string;
    sala_nombre: string;
    fecha: string;
    responsable: string;
    entidad: string;
    usuario_creador: string;
    capacitadores: string;
    estado_pantalla: string;
    estado: string;
    se_encendio: boolean;
    se_apago: boolean;
    se_conecto_a_cargar: boolean;
    nivel_bateria: number;
    observaciones: string;
}

interface Props {
    historial: PaginatedData<HistorialItem>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Historial de Equipos',
        href: '/admin/historial-equipos',
    },
];

export default function HistorialEquipos({ historial }: Props) {
    
    const handlePageChange = useCallback((url: string | null) => {
        if (url) {
            router.get(url, undefined, {
                preserveState: true,
                preserveScroll: true,
                only: ['historial'],
            });
        }
    }, []);
    
    const getEstadoColor = (estado: string) => {
        switch (estado?.toLowerCase()) {
            case 'excelente': return 'bg-green-100 text-green-800';
            case 'bueno': return 'bg-blue-100 text-blue-800';
            case 'regular': return 'bg-yellow-100 text-yellow-800';
            case 'malo': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const columns: ColumnDef<HistorialItem>[] = [
        {
            accessorKey: 'marca',
            header: 'Equipo',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    
                    <div>
                        <p className="font-medium">{row.original.marca} {row.original.modelo}</p>
                        <p className="text-sm text-gray-500">{row.original.sala_nombre}</p>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'fecha',
            header: 'Fecha',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    
                    <span>{row.original.fecha}</span>
                </div>
            ),
        },
        {
            accessorKey: 'responsable',
            header: 'Responsables',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div>
                        <p className="font-medium">{row.original.responsable}</p>
                        <p className="text-sm text-gray-500">{row.original.entidad}</p>
                        {row.original.capacitadores && (
                            <p className="text-xs text-blue-600">Capacitadores: {row.original.capacitadores}</p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'estado',
            header: 'Estado Final',
            cell: ({ row }) => (
                <div>
                    {row.original.estado && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getEstadoColor(row.original.estado)}`}>
                            {row.original.estado}
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'estado_pantalla',
            header: 'Estado Pantalla',
            cell: ({ row }) => (
                <div>
                    {row.original.estado_pantalla && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getEstadoColor(row.original.estado_pantalla)}`}>
                            {row.original.estado_pantalla}
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'nivel_bateria',
            header: 'Batería',
            cell: ({ row }) => (
                <div>
                    {row.original.nivel_bateria !== null && (
                        <span className="text-sm font-medium">
                            {row.original.nivel_bateria}%
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'acciones',
            header: 'Acciones Realizadas',
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1">
                    {row.original.se_encendio && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            Encendido
                        </span>
                    )}
                    {row.original.se_apago && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            Apagado
                        </span>
                    )}
                    {row.original.se_conecto_a_cargar && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                            Cargado
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'observaciones',
            header: 'Observaciones',
            cell: ({ row }) => (
                <div className="max-w-xs">
                    {row.original.observaciones && (
                        <p className="text-sm text-gray-600 truncate" title={row.original.observaciones}>
                            {row.original.observaciones}
                        </p>
                    )}
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Historial de Uso de Equipos" />
            
            <div className="p-4">
                {/* Tabla de datos con paginación */}
                <DataTable 
                    columns={columns} 
                    data={historial.data}
                    pagination={{
                        from: historial.from,
                        to: historial.to,
                        total: historial.total,
                        links: historial.links,
                        OnPageChange: handlePageChange,
                    }}
                />
            </div>
        </AppLayout>
    );
}
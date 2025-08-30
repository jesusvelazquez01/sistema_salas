import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Sala, type PageProps, type PaginatedData, type Reserva } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { RotateCcw, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps extends PageProps {
    salas: Sala[];
    reservasEnCurso: PaginatedData<Reserva>;
}

export default function Dashboard({ salas, reservasEnCurso }: DashboardProps) {

    // Columnas para el DataTable de reservas
    const columns: ColumnDef<Reserva>[] = [
        {
            accessorKey: 'entidad',
            header: 'Área',
            cell: ({ row }) => row.getValue('entidad') || 'Sin área'
        },
        {
            accessorKey: 'sala.nombre',
            header: 'Sala',
            cell: ({ row }) => row.original.sala?.nombre || 'Desconocida'
        },
        {
            accessorKey: 'responsable',
            header: 'Jefe de Área',
        },
        {
            accessorKey: 'capacitadores',
            header: 'Capacitadores',
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
            accessorKey: 'hora_inicio',
            header: 'Horario',
            cell: ({ row }) => `${row.original.hora_inicio} - ${row.original.hora_fin}`
        },
        {
            accessorKey: 'cantidad_equipos',
            header: 'Cant. Equipos',
        },
        {
            accessorKey: 'motivo',
            header: 'Motivo',
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

    // Función para manejar cambios de página
    const handlePageChange = (url: string | null) => {
        if (url) {
            router.get(url);
        }
    };

    // Función para obtener la ruta de la imagen (ajustar según tu lógica)
    const getSalaImageUrl = (salaId: number) => {
        // Ejemplo: asume que las imágenes están en /images/salas/sala-[id].jpg
        return `/image/sala_${salaId}.jpg`;
        // O si las nombras por el nombre de la sala (convertido a slug), ej: `/images/salas/${sala.nombre.toLowerCase().replace(/\s/g, '-')}.jpg`
    };

    // --- Función para refrescar las reservas en curso ---
    const handleRefreshReservasEnCurso = () => {
        console.log('Solicitando refresco de reservas en curso...');
        // Usa Inertia.js para recargar solo la prop 'reservasEnCurso'
        // Esto hará una nueva solicitud al backend y actualizará solo esa parte de los datos de la página.
        router.reload({ only: ['reservasEnCurso'] });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="p-6">
                    <h1 className="text-3xl font-bold mb-6 text-gray-800">Seleccioná una sala</h1>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {salas?.map((sala: Sala) => (
                            <Link key={sala.id} href={`/salas/${sala.id}/reservas`}>
                                <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
                                    <CardHeader className="p-0">
                                        <div className="w-full h-48 overflow-hidden rounded-t-lg">
                                            <img
                                                src={getSalaImageUrl(sala.id)}
                                                alt={`Imagen de ${sala.nombre}`}
                                                className="w-full h-full object-cover transition-transform duration-200 hover:scale-110"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/images/placeholder.jpg';
                                                }}
                                            />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <CardTitle className="text-xl text-orange-700 mb-2">
                                            {sala.nombre}
                                        </CardTitle>
                                        <div className="space-y-2">
                                            <div className="flex items-center text-gray-600">
                                                <Users className="h-4 w-4 mr-2" />
                                                <span>Capacidad: {sala.capacidad}</span>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <MapPin className="h-4 w-4 mr-2" />
                                                <span className="text-sm">{sala.ubicacion}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                    {/* Sección de Reservas de Hoy */}
                    <div className="mt-8">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-xl text-gray-800">
                                        Reservas de Hoy
                                    </CardTitle>
                                    <button
                                        onClick={handleRefreshReservasEnCurso}
                                        className="text-gray-500 hover:text-orange-600 w-8 h-8 flex items-center justify-center transition-colors duration-200 rounded-full hover:bg-gray-100"
                                        title="Refrescar reservas"
                                    >
                                        <RotateCcw className="h-5 w-5" />
                                    </button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {reservasEnCurso && reservasEnCurso.data && reservasEnCurso.data.length > 0 ? (
                                    <DataTable
                                        columns={columns}
                                        data={reservasEnCurso.data}
                                        pagination={{
                                            from: reservasEnCurso.data.length > 0 ? ((reservasEnCurso.current_page - 1) * reservasEnCurso.per_page) + 1 : 0,
                                            to: Math.min(reservasEnCurso.current_page * reservasEnCurso.per_page, reservasEnCurso.total),
                                            total: reservasEnCurso.total,
                                            links: reservasEnCurso.links,
                                            OnPageChange: handlePageChange,
                                        }}
                                    />
                                ) : (
                                    <p className="text-gray-500 text-center py-8">
                                        No hay reservas para hoy.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}

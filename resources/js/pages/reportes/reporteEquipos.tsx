import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { 
    Chart as ChartJS, 
    ArcElement, 
    Tooltip, 
    Legend, 
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Filler
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';
import { Calendar, Filter, RefreshCw } from 'lucide-react';

ChartJS.register(
    ArcElement, 
    Tooltip, 
    Legend, 
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Filler
);

interface ReportesEquiposProps {
    chartLabels: string[];
    chartValues: number[];
    backgroundColors?: string[];
    borderColors?: string[];
    monthlyData: {
        labels: string[];
        values: number[];
    };
    equipos?: Array<{id: number, marca: string, modelo: string, sala: {id: number, nombre: string}}>;
    salas?: Array<{id: number, nombre: string}>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reportes de Uso de Equipos',
        href: '/admin/reportes-equipos',
    },
];

export default function ReporteEquipos({ 
    chartLabels, 
    chartValues, 
    backgroundColors, 
    borderColors, 
    monthlyData,
    equipos = [], 
    salas = [] 
}: ReportesEquiposProps) {
    const [filtros, setFiltros] = useState({
        fechaInicio: '',
        fechaFin: '',
        equipoSeleccionado: '',
        salaSeleccionada: '',
    });
    
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const defaultBackgroundColors = [
        'rgba(235, 127, 52, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(239, 68, 68, 0.8)',
    ];
    const defaultBorderColors = [
        'rgba(235, 127, 52, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(139, 92, 246, 1)',
        'rgba(239, 68, 68, 1)',
    ];

    // Datos para gráfico mensual
    const monthlyChartData = {
        labels: monthlyData.labels,
        datasets: [{
            label: 'Usos por Mes',
            data: monthlyData.values,
            backgroundColor: 'rgba(235, 127, 52, 0.8)',
            borderColor: 'rgba(235, 127, 52, 1)',
            borderWidth: 2,
            borderRadius: 4,
        }]
    };

    const doughnutData = {
        labels: chartLabels,
        datasets: [
            {
                label: 'Cantidad de Usos',
                data: chartValues,
                backgroundColor: backgroundColors || defaultBackgroundColors,
                borderColor: borderColors || defaultBorderColors,
                borderWidth: 2,
            },
        ],
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: 'rgb(50, 50, 50)',
                    font: { size: 12 }
                }
            },
            title: {
                display: true,
                text: 'Distribución por Equipos',
                font: { size: 16, weight: 'bold' },
                color: 'rgb(30, 30, 30)'
            }
        },
        cutout: '60%',
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: 'Usos Mensuales de Equipos',
                font: { size: 16, weight: 'bold' }
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        return `${context.parsed.y} usos`;
                    }
                }
            }
        },
        scales: {
            y: { beginAtZero: true }
        }
    };

    const totalUsos = chartValues.reduce((sum, val) => sum + val, 0);
    const equipoFavorito = chartLabels[chartValues.indexOf(Math.max(...chartValues))];

    const handleFiltroChange = (campo: string, valor: string) => {
        setFiltros(prev => ({ ...prev, [campo]: valor }));
    };

    const aplicarFiltros = () => {
        const params = new URLSearchParams();
        if (filtros.fechaInicio) params.append('fecha_inicio', filtros.fechaInicio);
        if (filtros.fechaFin) params.append('fecha_fin', filtros.fechaFin);
        if (filtros.equipoSeleccionado) params.append('equipo_id', filtros.equipoSeleccionado);
        if (filtros.salaSeleccionada) params.append('sala_id', filtros.salaSeleccionada);
        
        window.location.href = `/admin/reportes-equipos?${params.toString()}`;
    };

    const limpiarFiltros = () => {
        setFiltros({
            fechaInicio: '',
            fechaFin: '',
            equipoSeleccionado: '',
            salaSeleccionada: '',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reportes de Uso de Equipos" />
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard de Equipos</h1>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setMostrarFiltros(!mostrarFiltros)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
                        >
                            <Filter size={16} />
                            Filtros
                        </button>
                    </div>
                </div>

                {/* Panel de Filtros */}
                {mostrarFiltros && (
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Filter size={20} />
                            Filtros de Búsqueda
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Rango de Fechas */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Calendar size={16} className="inline mr-1" />
                                    Fecha Inicio
                                </label>
                                <input
                                    type="date"
                                    value={filtros.fechaInicio}
                                    onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Calendar size={16} className="inline mr-1" />
                                    Fecha Fin
                                </label>
                                <input
                                    type="date"
                                    value={filtros.fechaFin}
                                    onChange={(e) => handleFiltroChange('fechaFin', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Selector de Equipo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Equipo Específico
                                </label>
                                <select
                                    value={filtros.equipoSeleccionado}
                                    onChange={(e) => handleFiltroChange('equipoSeleccionado', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Todos los equipos</option>
                                    {equipos.map(equipo => (
                                        <option key={equipo.id} value={equipo.id}>
                                            {equipo.marca} {equipo.modelo} - {equipo.sala.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Selector de Sala */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sala
                                </label>
                                <select
                                    value={filtros.salaSeleccionada}
                                    onChange={(e) => handleFiltroChange('salaSeleccionada', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Todas las salas</option>
                                    {salas.map(sala => (
                                        <option key={sala.id} value={sala.id}>{sala.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between mt-6 gap-4">
                            <div className="flex gap-3">
                                <button
                                    onClick={limpiarFiltros}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    <RefreshCw size={16} />
                                    Limpiar
                                </button>
                                <button
                                    onClick={aplicarFiltros}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#eb7f34] text-white rounded-lg hover:bg-[#d16d2a] transition-colors"
                                >
                                    Aplicar Filtros
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Métricas principales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-600">Total Usos</h3>
                        <p className="text-3xl font-bold text-[#eb7f34]">{totalUsos}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-600">Equipo Más Usado</h3>
                        <p className="text-xl font-bold text-[#eb7f34]">{equipoFavorito}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-600">Promedio por Equipo</h3>
                        <p className="text-3xl font-bold text-green-600">{chartLabels.length > 0 ? Math.round(totalUsos / chartLabels.length) : 0}</p>
                    </div>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="h-80">
                            <Doughnut data={doughnutData} options={doughnutOptions} />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="h-80">
                            <Bar data={monthlyChartData} options={barOptions} />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
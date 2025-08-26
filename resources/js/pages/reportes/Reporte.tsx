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
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { type BreadcrumbItem } from '@/types';
import { useState, useEffect } from 'react';
import { Calendar, Filter, RefreshCw } from 'lucide-react';
// N8N CHAT - COMENTADO
// import '@n8n/chat/style.css';
// import { createChat } from '@n8n/chat';

interface ReportesProps {
    chartLabels: string[];
    chartValues: number[];
    backgroundColors?: string[];
    borderColors?: string[];
    monthlyData: {
        labels: string[];
        values: number[];
    };
    weeklyData: {
        labels: string[];
        values: number[];
    };
    salas?: Array<{id: number, nombre: string}>;
    entidades?: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reportes de Uso de Salas',
        href: '/admin/reportes-uso',
    },
];

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

export default function Reportes({ 
    chartLabels, 
    chartValues, 
    backgroundColors, 
    borderColors, 
    monthlyData,
    weeklyData,
    salas = [], 
    entidades = [] 
}: ReportesProps) {
    const [filtros, setFiltros] = useState({
        fechaInicio: '',
        fechaFin: '',
        salaSeleccionada: '',
        entidadSeleccionada: '',
        tipoVista: 'mensual'
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
            label: 'Reservas por Mes',
            data: monthlyData.values,
            backgroundColor: 'rgba(235, 127, 52, 0.8)',
            borderColor: 'rgba(235, 127, 52, 1)',
            borderWidth: 2,
            borderRadius: 4,
        }]
    };

    // Datos para gráfico semanal
    const weeklyChartData = {
        labels: weeklyData.labels,
        datasets: [{
            label: 'Reservas por Semana',
            data: weeklyData.values,
            borderColor: 'rgba(59, 130, 246, 1)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: 'rgba(59, 130, 246, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
        }]
    };

    const doughnutData = {
        labels: chartLabels,
        datasets: [
            {
                label: 'Cantidad de Reservas',
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
                text: 'Distribución por Salas',
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
                text: 'Reservas Mensuales',
                font: { size: 16, weight: 'bold' }
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        return `${context.parsed.y} reservas`;
                    }
                }
            }
        },
        scales: {
            y: { beginAtZero: true }
        }
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: 'Tendencia Semanal',
                font: { size: 16, weight: 'bold' }
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        return `${context.parsed.y} reservas`;
                    }
                }
            }
        },
        scales: {
            y: { beginAtZero: true }
        }
    };

    const totalReservas = chartValues.reduce((sum, val) => sum + val, 0);
    const salaFavorita = chartLabels[chartValues.indexOf(Math.max(...chartValues))];

    const handleFiltroChange = (campo: string, valor: string) => {
        setFiltros(prev => ({ ...prev, [campo]: valor }));
    };

    const aplicarFiltros = () => {
        const params = new URLSearchParams();
        if (filtros.fechaInicio) params.append('fecha_inicio', filtros.fechaInicio);
        if (filtros.fechaFin) params.append('fecha_fin', filtros.fechaFin);
        if (filtros.salaSeleccionada) params.append('sala_id', filtros.salaSeleccionada);
        if (filtros.entidadSeleccionada) params.append('entidad', filtros.entidadSeleccionada);
        params.append('tipo_vista', filtros.tipoVista);
        
        window.location.href = `/admin/reportes-uso?${params.toString()}`;
    };

    const limpiarFiltros = () => {
        setFiltros({
            fechaInicio: '',
            fechaFin: '',
            salaSeleccionada: '',
            entidadSeleccionada: '',
            tipoVista: 'mensual'
        });
    };

    // N8N CHAT - COMENTADO
    // useEffect(() => {
    //     createChat({
    //         webhookUrl: 'https://n8n.srv912594.hstgr.cloud/webhook/dc41da99-f78f-4949-bbdd-596c3ae5b1fb/chat',
    //         target: '#n8n-chat',
    //         mode: 'window',
    //         defaultHeight: 500,
    //         defaultWidth: '100%',
    //         enableStreaming: false,
    //         loadPreviousSession: true,
    //         defaultLanguage: 'en',
    //         showWelcomeScreen: false,
    //         initialMessages: [
    //             'Hola! 👋 Soy tu asistente virtual.',
    //             'Puedo ayudarte con información sobre reservas, salas y estadísticas.'
    //         ],
    //         i18n: {
    //             en: {
    //                 title: 'Asistente Virtual de Salas',
    //                 subtitle: 'Estoy 24/7 para poder ayudarte con reservas y consultas.',
    //                 footer: '',
    //                 inputPlaceholder: 'Escríbeme una consulta sobre salas o reservas...',
    //                 getStarted: 'Comenzar chat',
    //                 inputDisabledPlaceholder: 'Escribiendo...',
    //                 closeButtonTooltip: ''
    //             }
    //         }
    //     });
    // }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reportes de Uso de Salas" />
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard de Reportes</h1>
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

                            {/* Selector de Sala */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sala Específica
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

                            {/* Selector de Entidad */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Entidad
                                </label>
                                <select
                                    value={filtros.entidadSeleccionada}
                                    onChange={(e) => handleFiltroChange('entidadSeleccionada', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Todas las entidades</option>
                                    {entidades.map(entidad => (
                                        <option key={entidad} value={entidad}>{entidad}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                       
                        <div className="flex flex-wrap items-center justify-between mt-6 gap-4">
                            <div className="flex items-center gap-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Vista:
                                </label>
                                <div className="flex gap-2">
                                    {['mensual', 'anual'].map(tipo => (
                                        <button
                                            key={tipo}
                                            onClick={() => handleFiltroChange('tipoVista', tipo)}
                                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                                filtros.tipoVista === tipo
                                                    ? 'bg-[#eb7f34] text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                        >
                                            {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
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
                
                {/* Indicador de filtros activos */}
                {(filtros.fechaInicio || filtros.fechaFin || filtros.salaSeleccionada || filtros.entidadSeleccionada) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Filter size={16} className="text-blue-600" />
                                <span className="text-blue-800 font-medium">Filtros activos:</span>
                                <div className="flex gap-2 flex-wrap">
                                    {filtros.fechaInicio && (
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                            Desde: {filtros.fechaInicio}
                                        </span>
                                    )}
                                    {filtros.fechaFin && (
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                            Hasta: {filtros.fechaFin}
                                        </span>
                                    )}
                                    {filtros.salaSeleccionada && (
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                            Sala: {salas.find(s => s.id.toString() === filtros.salaSeleccionada)?.nombre}
                                        </span>
                                    )}
                                    {filtros.entidadSeleccionada && (
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                            Entidad: {filtros.entidadSeleccionada}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={limpiarFiltros}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                Limpiar todos
                            </button>
                        </div>
                    </div>
                )}

                {/* Métricas principales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-600">Total Reservas</h3>
                        <p className="text-3xl font-bold text-[#eb7f34]">{totalReservas}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-600">Sala Más Usada</h3>
                        <p className="text-xl font-bold text-[#eb7f34]">{salaFavorita}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-600">Promedio por Sala</h3>
                        <p className="text-3xl font-bold text-green-600">{Math.round(totalReservas / chartLabels.length)}</p>
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
                    
                    <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
                        <div className="h-80">
                            <Line data={weeklyChartData} options={lineOptions} />
                        </div>
                    </div>
                </div>
            </div>
            </AppLayout>
    );
}
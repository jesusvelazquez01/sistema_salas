import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Sala {
    id: number;
    nombre: string;
    capacidad?: number;
    ubicacion?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Reserva {
    id: number;
    sala_id: number;
    entidad: string;
    responsable: string;
    responsable_id?: string;
    motivo?: string;
    cantidad_equipos?: number;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    user_id?: number;
    sala?: Sala;
    capacitadores?: Capacitador[];
    created_at?: string;
    updated_at?: string;
}
export interface Equipo {
    id: number;
    marca: string;
    modelo: string;
    sistema_operativo: string;
    estado_inicial: string;
    fecha_adquisicion: string;
    fecha_baja?: string;
    sala_id: number;
    sala?: Sala;
    created_at?: string;
    updated_at?: string;
}

export interface Responsable {
    id: number;
    nombre: string;
    apellido: string;
    dni?: string;
    telefono?: string;
    correo?: string;
    area?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Capacitador {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
    telefono: string;
    correo: string;
    reserva_id?: number;
    reserva?: Reserva;
    created_at?: string;
    updated_at?: string;
}
export interface ControlUso {
    id: number;
    reserva_id: number;
    fue_utilizada: string;
    observaciones: string;
    equipos?: ControlUsoEquipo[];
    reserva?: Reserva;
    created_at?: string;
    updated_at?: string;
}

export interface ControlUsoEquipo {
    id: number;
    control_uso_id: number;
    equipo_id: number;
    estado_pantalla?: string;
    estado?: string;
    se_encendio?: boolean;
    se_apago?: boolean;
    se_conecto_a_cargar?: boolean;
    nivel_bateria?: number;
    observaciones?: string;
    equipo?: Equipo;
    created_at?: string;
    updated_at?: string;
}



export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

export interface PageProps{
    reserva: PaginationData<Reserva>;
    [key:string]: unknown;
    //ROLES Y PERMISOS
    auth?:{
        user: User;
        roles: string[];
        permissions: string[];
    }
    roles: PaginatedData<Role> | {id: number; name: string}[];
    users: PaginatedData<UserWithRoles> [];
}



 export   interface Role{
        id:number;
        name:string;
        permission_count?:number;
    }

export interface Permission {
    id: number;
    name: string;
    guard_name?: string;
    created_at?: string;
    updated_at?: string;
}

export interface UserWithRoles{
    id:number;
    name:string;
    email:string;
    roles:{id:number, name: string}[];
}

export type PageProps<T = Record<string, unknown>> = SharedData & T;

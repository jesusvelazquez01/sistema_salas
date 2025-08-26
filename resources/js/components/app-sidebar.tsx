import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {CalendarPlus2, UserRoundSearch, LaptopMinimalCheck, Folder, Calendar, ClipboardPlus, DoorOpen, MessageCircleWarning, Laptop, ShieldPlus } from 'lucide-react';
import AppLogo from './app-logo';
// ===== SECCIÓN PRINCIPAL =====
const principalItems: NavItem[] = [
    {
        title: 'Calendario',
        href: '/dashboard',
        icon: CalendarPlus2,
        // permission: 'dashboard.view'
    },
];

// ===== SECCIÓN GESTIÓN DE RECURSOS =====
const gestionRecursosItems: NavItem[] = [
    {
        title: 'Salas',
        href: '/admin/salas',
        icon: DoorOpen,
        // permission: 'salas.view'
    },
    {
        title: 'Equipos',
        href: '/equipos',
        icon: Laptop,
        // permission: 'equipos.view'
    },
    {
        title: 'Responsables',
        href: '/admin/responsables',
        icon: UserRoundSearch,
    },
];

// ===== SECCIÓN RESERVAS Y USO =====
const reservasUsoItems: NavItem[] = [
    {
        title: 'Reservas Usuarios',
        href: '/admin/reservas',
        icon: Calendar,
        // permission: 'reservas.view.all'
    },
    {
        title: 'Uso de Salas',
        href: '/control-uso',
        icon: ClipboardPlus,
        // permission: 'control_uso.view'
    },
];

// ===== SECCIÓN REPORTES =====
const reportesItems: NavItem[] = [
    {
        title: 'Reportes de Salas',
        href: '/admin/reportes-uso',
        icon: MessageCircleWarning,
        // permission: 'reportes.view'
    },
    {
        title: 'Reportes de Equipos',
        href: '/admin/reportes-equipos',
        icon: LaptopMinimalCheck,
        // permission: 'reportes.view'
    },
];

// ===== SECCIÓN ADMINISTRACIÓN =====
const administracionItems: NavItem[] = [
    {
        title: 'Usuarios',
        href: '/users',
        icon: UserRoundSearch,
        // permission: 'roles.view'
    },
    {
        title: 'Asignar Roles',
        href: '/users/roles',
        icon: ShieldPlus,
        // permission: 'usuarios.view'
    },
    {
        title: 'Roles',
        href: '/roles',
        icon: Folder,
        // permission: 'configuracion.view'
    },
];

// Grupos de navegación organizados por secciones
const navGroups = [
    {
        title: 'Principal',
        items: principalItems
    },
    {
        title: 'Gestión de Recursos',
        items: gestionRecursosItems
    },
    {
        title: 'Reservas y Uso',
        items: reservasUsoItems
    },
    {
        title: 'Reportes',
        items: reportesItems
    },
    {
        title: 'Administración',
        items: administracionItems
    },
];
const footerNavItems: NavItem[] = [
    {
        title: 'Contacto Soporte',
        href: 'https://api.whatsapp.com/send/?phone=5403885474266&text&type=phone_number&app_absent=0',
        icon: Folder,
    },
   
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {navGroups.map((group, index) => (
                    <div key={group.title} className="mb-4">
                        {index > 0 && <div className="mx-3 mb-3"><hr className="border-sidebar-border" /></div>}
                        <div className="px-3 mb-2">
                            <h4 className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
                                {group.title}
                            </h4>
                        </div>
                        <NavMain items={group.items} />
                    </div>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            {/* Este es el contenedor cuadrado de 32x32px */}
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                {/* AQUÍ EL CAMBIO:
                  - h-6: Fija el alto a 24px.
                  - w-auto: El navegador calcula el ancho para que la imagen no se deforme.
                */}
                <AppLogoIcon className="h-6 w-auto" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">Gestion Salas</span>
            </div>
        </>
    );
}

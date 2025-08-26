import AppLogoIcon from '@/components/app-logo-icon';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    const { name} = usePage<SharedData>().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-gradient-to-br from-orange-600 via-orange-500 to-blue-900 p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/90 via-orange-500/80 to-blue-900/90" />
                <div className="absolute inset-0">
                    <div className="absolute top-10 right-10 w-48 h-48 bg-white/20 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '4s' }}></div>
                    <div className="absolute bottom-20 left-10 w-36 h-36 bg-white/15 rounded-full blur-xl animate-ping" style={{ animationDuration: '3s' }}></div>
                    <div className="absolute top-1/2 right-1/4 w-28 h-28 bg-white/25 rounded-full blur-lg animate-pulse" style={{ animationDuration: '2s' }}></div>
                    <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-white/20 rounded-full blur-xl animate-spin" style={{ animationDuration: '8s' }}></div>
                    <div className="absolute top-3/4 right-1/3 w-24 h-24 bg-white/15 rounded-full blur-lg animate-bounce" style={{ animationDuration: '5s', animationDelay: '2s' }}></div>
                </div>
                <div className="relative z-20 flex flex-col justify-between h-full">
                    <div>
                        <Link href={route('home')} className="flex items-center text-lg font-medium mb-8">
                            <AppLogoIcon className="mr-3 size-10 fill-current text-white" />
                            <span className="text-xl font-semibold">{name}</span>
                        </Link>
                        <div className="space-y-3">
                            <h2 className="text-3xl lg:text-4xl font-bold leading-tight">Ministerio de Jujuy</h2>
                            <p className="text-xl lg:text-2xl text-neutral-200 font-light">Sistema de Reservas Internas</p>
                            <div className="w-16 h-1 bg-white/60 mt-6"></div>
                        </div>
                    </div>

                </div>
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link href={route('home')} className="relative z-20 flex items-center justify-center lg:hidden">
                        <AppLogoIcon className="h-10 fill-current text-black sm:h-12" />
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-sm text-balance text-muted-foreground">{description}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}

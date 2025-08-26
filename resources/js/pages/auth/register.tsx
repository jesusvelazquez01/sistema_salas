import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
    <AuthLayout
    title="Crea una cuenta"
    description="Ingrese sus datos a continuación para crear su cuenta"
>
    <Head title="Registro" />

    <div className="mx-auto max-w-md w-full bg-white/80 dark:bg-[#121212] backdrop-blur-md rounded-xl shadow-xl p-8 border border-gray-200 dark:border-gray-800 transition-all animate-fade-in">
        <form className="flex flex-col gap-6" onSubmit={submit}>
            <div className="grid gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="name" className="text-base font-medium text-gray-700 dark:text-gray-200">
                        Nombre y Apellido
                    </Label>
                    <Input
                        id="name"
                        type="text"
                        required
                        autoFocus
                        tabIndex={1}
                        autoComplete="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        disabled={processing}
                        placeholder="Nombre y Apellido"
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="email" className="text-base font-medium text-gray-700 dark:text-gray-200">
                        Correo Electrónico
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        required
                        tabIndex={2}
                        autoComplete="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        disabled={processing}
                        placeholder="email@example.com"
                    />
                    <InputError message={errors.email} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password" className="text-base font-medium text-gray-700 dark:text-gray-200">
                        Contraseña
                    </Label>
                    <Input
                        id="password"
                        type="password"
                        required
                        tabIndex={3}
                        autoComplete="new-password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        disabled={processing}
                        placeholder="••••••••"
                    />
                    <InputError message={errors.password} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password_confirmation" className="text-base font-medium text-gray-700 dark:text-gray-200">
                        Confirmar Contraseña
                    </Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        required
                        tabIndex={4}
                        autoComplete="new-password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        disabled={processing}
                        placeholder="••••••••"
                    />
                    <InputError message={errors.password_confirmation} />
                </div>

                <Button
                    type="submit"
                    className="mt-4 w-full bg-orange-600 hover:bg-orange-500 text-white transition-all duration-200"
                    tabIndex={5}
                    disabled={processing}
                >
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                    Crear cuenta
                </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground mt-6">
                ¿Ya tienes una cuenta?{' '}
                <TextLink href={route('login')} tabIndex={6} className="text-blue-900 hover:underline">
                    Ingresar
                </TextLink>
            </div>
        </form>
    </div>
</AuthLayout>

    );
}

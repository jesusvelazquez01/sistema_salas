import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';



export default function Register() {
  

    return (
    <AuthLayout
    title="Crea una cuenta"
    description="Ingrese sus datos a continuación para crear su cuenta"
>
    <Head title="Registro" />
</AuthLayout>

    );
}

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PageProps, Role, UserWithRoles } from '@/types';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Users', href: '/users' },
  { title: 'Edit', href: '' },
];

interface Props extends PageProps {
  user: UserWithRoles;
  roles: Role[];
}

export default function Edit() {
  const { user, roles } = usePage<Props>().props;
  const { data, setData, put, processing, errors } = useForm({
    name: user.name,
    email: user.email,
    role: user.roles[0]?.name ?? '',
    password: '',
    password_confirmation: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('users.update', user.id));
  };

  const handleCancel = () => {
    if (data.name !== user.name || data.email !== user.email || data.role !== user.roles[0]?.name) {
      if (!confirm('Are you sure you want to leave? Unsaved changes will be lost.')) return;
    }
    router.visit(route('users.index'));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit User" />
      <div className="flex flex-col gap-4 p-4">
        <h1 className="text-2xl font-bold">Editar Usuario</h1>
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>Informacion de usuario</CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  disabled={processing}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="email">Correo Electronico</Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  disabled={processing}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="role">Rol</Label>
                <Select
                  value={data.role}
                  onValueChange={(value) => setData('role', value)}
                  disabled={processing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="password">Nueva Contraseña (opcional)</Label>
                <Input
                  id="password"
                  type="password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  disabled={processing}
                  placeholder="Dejar vacío para mantener la contraseña actual"
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="password_confirmation">Confirmar Nueva Contraseña</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  value={data.password_confirmation}
                  onChange={(e) => setData('password_confirmation', e.target.value)}
                  disabled={processing}
                  placeholder="Confirmar nueva contraseña"
                />
                {errors.password_confirmation && <p className="text-sm text-red-500">{errors.password_confirmation}</p>}
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={processing}>
                {processing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </div>
                ) : (
                  'Guardar'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}

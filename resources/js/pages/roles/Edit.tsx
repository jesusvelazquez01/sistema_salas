import { Head, router, useForm, usePage } from '@inertiajs/react';
import type { PageProps, Role, BreadcrumbItem, Permission } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles',
        href: '/roles',
    },
    {
        title: 'Edit',
        href: '#',
    },
];

export default function Edit() {
    const { role, permissions, rolePermissions } = usePage<
        PageProps & {
            role: Role;
            permissions: Record<string, Permission[]>;
            rolePermissions: string[];
        }
    >().props;

    const { data, setData, put, processing } = useForm({
        permissions: rolePermissions,
    });

    const handleCheckboxChange = (permissionName: string, checked: boolean) => {
        if (checked) {
            setData('permissions', [...data.permissions, permissionName]);
        } else {
            setData(
                'permissions',
                data.permissions.filter((p) => p !== permissionName)
            );
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('roles.update', { role: role.id }));
    };

    const handleCancel = () => {
        router.visit(route('roles.index'));
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Role - ${role.name}`} />
             <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-2xl font-bold">Editar Rol: {role.name}</h1>
                <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <CardContent className="flex flex-col gap-4">
                    {Object.entries(permissions).map(([entity, perms]) => (
                        <div key={entity} className="space-y-2">
                            <h2 className="text-lg font-semibold capitalize">{entity}</h2>
                            <div className="flex flex-wrap gap-4">
                                {perms.map((permission) => (
                                    <div key={permission.id} className="flex items-center gap-2 w-1/4">
                                        <Checkbox
                                            id={`perm-${permission.id}`}
                                            checked={data.permissions.includes(permission.name)}
                                            onCheckedChange={(checked) =>
                                                handleCheckboxChange(permission.name, !!checked)
                                            }
                                        />
                                        <label
                                            htmlFor={`perm-${permission.id}`}
                                            className="text-sm"
                                        >
                                            {permission.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleCancel}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Guarda
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

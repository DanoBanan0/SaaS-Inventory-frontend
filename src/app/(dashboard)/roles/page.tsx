"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Plus, Trash2, Pencil, Users } from "lucide-react";
import Swal from "sweetalert2";
import { CreateRoleDialog } from "@/components/roles/CreateRoleDialog";
import { EditRoleDialog } from "@/components/roles/EditRoleDialog";

export default function RolesPage() {
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<any>(null);

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/roles");
            let data = res.data;

            // --- LÓGICA DE SEGURIDAD VISUAL ---
            // 1. Obtener mi role_id del localStorage
            const userStr = localStorage.getItem('user');
            const currentUser = userStr ? JSON.parse(userStr) : null;
            const myRoleId = currentUser?.role_id;

            // 2. Buscar MI rol dentro de la lista que acabamos de descargar
            const myRoleObj = data.find((r: any) => r.id === myRoleId);
            const myRoleName = myRoleObj?.name?.toLowerCase() || "";

            // 3. ¿Soy Developer?
            const amIDev = myRoleName.includes('dev') || myRoleName.includes('programador');

            // 4. Si NO soy Developer, oculto los roles "Developer" de la tabla
            if (!amIDev) {
                data = data.filter((r: any) => {
                    const rName = r.name.toLowerCase();
                    return !rName.includes('dev') && !rName.includes('programador');
                });
            }
            // ----------------------------------

            setRoles(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const handleEdit = (role: any) => {
        setSelectedRole(role);
        setIsEditOpen(true);
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: "¿Eliminar Rol?",
            text: "No podrás eliminarlo si hay usuarios asignados.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            confirmButtonColor: "#d33"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/roles/${id}`);
                    Swal.fire("Eliminado", "Rol eliminado correctamente.", "success");
                    fetchRoles();
                } catch (error: any) {
                    Swal.fire("Error", error.response?.data?.message || "No se pudo eliminar", "error");
                }
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-blue-600" />
                        Roles y Permisos
                    </h1>
                    <p className="text-slate-500 text-sm">Define los niveles de acceso al sistema</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-700 hover:bg-blue-800">
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Rol
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-100">
                            <TableRow>
                                <TableHead className="font-bold text-slate-700">Nombre del Rol</TableHead>
                                <TableHead className="font-bold text-slate-700 text-center">Usuarios Asignados</TableHead>
                                <TableHead className="text-right font-bold text-slate-700 pr-6">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={3} className="h-24 text-center">Cargando...</TableCell></TableRow>
                            ) : roles.length === 0 ? (
                                <TableRow><TableCell colSpan={3} className="h-24 text-center text-slate-500">No hay roles registrados.</TableCell></TableRow>
                            ) : (
                                roles.map((role) => (
                                    <TableRow key={role.id} className="hover:bg-slate-50/50">
                                        <TableCell className="font-medium text-lg text-slate-800">
                                            {role.name}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-100">
                                                <Users className="w-3 h-3 mr-1" />
                                                {role.users_count || 0}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-1">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(role)}>
                                                <Pencil className="w-4 h-4 text-slate-400 hover:text-blue-600" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(role.id)}>
                                                <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <CreateRoleDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSuccess={fetchRoles} />
            <EditRoleDialog open={isEditOpen} onOpenChange={setIsEditOpen} role={selectedRole} onSuccess={fetchRoles} />
        </div>
    );
}
"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UserCircle, Plus, Search, Ban, Pencil, CheckCircle, Code, User, XCircle, Unlock } from "lucide-react";
import Swal from "sweetalert2";
import { CreateUserDialog } from "@/components/users/CreateUserDialog";
import { EditUserDialog } from "@/components/users/EditUserDialog";
import { DataFilters } from "@/components/common/DataFilters";

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const getUserID = () => {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            const userObj = userStr ? JSON.parse(userStr) : null;
            return userObj?.id != null ? userObj.id.toString() : null;
        }
        return null;
    };

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/users?search=${search}`);
            let data = res.data.data || res.data;

            const myId = getUserID();
            const me = data.find((u: any) => u.id === myId);

            const myRoleName = me?.role?.name?.toLowerCase() || "";
            const amIDev = myRoleName.includes('dev') || myRoleName.includes('programador');

            data = data.filter((targetUser: any) => {
                const targetRoleName = targetUser.role?.name?.toLowerCase() || "";
                const isTargetDev = targetRoleName.includes('dev') || targetRoleName.includes('programador');

                if (isTargetDev) {
                    return amIDev;
                }
                return true;
            });

            setUsers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleEdit = (user: any) => {
        setSelectedUser(user);
        setIsEditOpen(true);
    };

    const handleDeactivate = (id: string) => {
        Swal.fire({
            title: "¿Desactivar Usuario?",
            text: "El usuario perderá el acceso al sistema inmediatamente.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, desactivar",
            confirmButtonColor: "#d33",
            cancelButtonText: "Cancelar"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/users/${id}`);
                    Swal.fire("Desactivado", "Acceso revocado correctamente.", "success");
                    fetchUsers();
                } catch (error: any) {
                    Swal.fire("Error", error.response?.data?.message || "No se pudo desactivar", "error");
                }
            }
        });
    };

    const handleActivate = (user: any) => {
        Swal.fire({
            title: "¿Reactivar Usuario?",
            text: "El usuario podrá volver a iniciar sesión.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, activar",
            confirmButtonColor: "#10b981",
            cancelButtonText: "Cancelar"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.put(`/users/${user.id}`, {
                        name: user.name,
                        email: user.email,
                        role_id: user.role_id,
                        is_active: true
                    });

                    Swal.fire("Activado", "El usuario tiene acceso nuevamente.", "success");
                    fetchUsers();
                } catch (error: any) {
                    Swal.fire("Error", error.response?.data?.message || "No se pudo activar", "error");
                }
            }
        });
    };

    const renderRoleBadge = (role: any) => {
        if (!role) return <Badge variant="outline">Sin Rol</Badge>;
        const name = role.name;
        const lowerName = name.toLowerCase();

        if (lowerName.includes('dev') || lowerName.includes('programador') || lowerName.includes('tec')) {
            return (
                <Badge className="bg-purple-600 hover:bg-purple-700 gap-1 pl-1">
                    <Code className="w-3 h-3 text-white" /> {name}
                </Badge>
            );
        }

        return (
            <Badge variant="outline" className="text-slate-700 border-slate-300 gap-1">
                <User className="w-3 h-3 text-slate-500" /> {name}
            </Badge>
        );
    };
    const clearFilters = () => {
        setSearch("");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <UserCircle className="h-6 w-6 text-blue-600" />
                        Usuarios del Sistema
                    </h1>
                </div>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="icon"
                                onClick={() => setIsCreateOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg h-10 w-10"
                            >
                                <Plus className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Nuevo Usuario</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <Card>
                <CardContent className="p-0 overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-100">
                            <TableRow>
                                <TableHead className="font-bold text-slate-700">Usuario</TableHead>
                                <TableHead className="font-bold text-slate-700">Rol</TableHead>
                                <TableHead className="font-bold text-slate-700">Estado</TableHead>
                                <TableHead className="text-right font-bold text-slate-700 pr-6">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={4} className="h-24 text-center">Cargando...</TableCell></TableRow>
                            ) : users.length === 0 ? (
                                <TableRow><TableCell colSpan={4} className="h-24 text-center text-slate-500">No hay usuarios visibles.</TableCell></TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id} className="hover:bg-slate-50/50">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-900">{user.name}</span>
                                                <span className="text-xs text-slate-500">{user.email}</span>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            {renderRoleBadge(user.role)}
                                        </TableCell>

                                        <TableCell>
                                            {user.is_active ? (
                                                <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                                    <CheckCircle className="w-4 h-4" /> Activo
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-slate-400 text-sm font-medium">
                                                    <XCircle className="w-4 h-4" /> Inactivo
                                                </div>
                                            )}
                                        </TableCell>

                                        <TableCell className="text-right space-x-1">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(user)} title="Editar">
                                                <Pencil className="w-4 h-4 text-slate-400 hover:text-blue-600" />
                                            </Button>

                                            {user.is_active ? (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeactivate(user.id)}
                                                    title="Desactivar Acceso"
                                                    className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                >
                                                    <Ban className="w-4 h-4" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleActivate(user)}
                                                    title="Reactivar Acceso"
                                                    className="text-slate-400 hover:text-green-600 hover:bg-green-50"
                                                >
                                                    <Unlock className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <CreateUserDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSuccess={fetchUsers} />
            <EditUserDialog open={isEditOpen} onOpenChange={setIsEditOpen} user={selectedUser} onSuccess={fetchUsers} />
        </div>
    );
}
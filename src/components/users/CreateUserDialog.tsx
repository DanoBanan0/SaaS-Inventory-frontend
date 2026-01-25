"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserPlus, Shield, Code, CheckCircle, XCircle, User } from "lucide-react";
import Swal from "sweetalert2";

interface CreateUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateUserDialog({ open, onOpenChange, onSuccess }: CreateUserDialogProps) {
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role_id: "",
        is_active: "1" // "1" para true, "0" para false (Laravel lo entiende)
    });

    useEffect(() => {
        if (open) {
            api.get("/roles")
                .then((res) => {
                    const allRoles = res.data;

                    // 1. Obtener el usuario actual (Asumiendo que lo guardaste en localStorage al login)
                    // Si usas un Context, cámbialo por: const { user } = useAuth();
                    const userStr = localStorage.getItem('user');
                    const currentUser = userStr ? JSON.parse(userStr) : null;

                    // Obtenemos el nombre del rol del usuario logueado (ej: "admin", "developer")
                    // Nota: Asegúrate de que tu backend envíe el objeto 'role' en el login
                    const myRoleName = currentUser?.role?.name?.toLowerCase() || "";

                    // 2. Filtrar dinámicamente por NOMBRE
                    const visibleRoles = allRoles.filter((r: any) => {
                        const roleName = r.name.toLowerCase();

                        // ¿Es este rol un rol de "Developer"?
                        const isDevRole = roleName.includes('dev');

                        // ¿Soy yo un "Developer"?
                        const amIDev = myRoleName.includes('dev');

                        // REGLA: Si el rol es Dev, y yo NO soy Dev -> OCULTAR
                        if (isDevRole && !amIDev) {
                            return false;
                        }

                        return true; // Mostrar el resto (Admin, User, etc.)
                    });

                    setRoles(visibleRoles);
                })
                .catch(console.error);
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!formData.name || !formData.email || !formData.password || !formData.role_id) {
            Swal.fire("Campos incompletos", "Complete todos los campos requeridos", "warning");
            return;
        }

        setLoading(true);
        try {
            // Convertimos "1"/"0" a booleano real o enviamos 1/0
            await api.post("/users", {
                ...formData,
                is_active: formData.is_active === "1"
            });

            Swal.fire({ icon: "success", title: "Usuario Creado", timer: 1500, showConfirmButton: false });
            setFormData({ name: "", email: "", password: "", role_id: "", is_active: "1" });
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            Swal.fire("Error", error.response?.data?.message || "Error al crear", "error");
        } finally {
            setLoading(false);
        }
    };

    const getRoleIcon = (roleName: string) => {
        const name = roleName?.toLowerCase() || "";
        if (name.includes('admin')) return <Shield className="w-4 h-4 text-blue-600" />;
        if (name.includes('dev')) return <Code className="w-4 h-4 text-purple-600" />;
        return <User className="w-4 h-4 text-slate-500" />;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-blue-600" />
                        Nuevo Usuario
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label>Nombre Completo</Label>
                        <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Contraseña</Label>
                        <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* ROL */}
                        <div className="space-y-2">
                            <Label>Rol</Label>
                            <Select value={formData.role_id} onValueChange={(val) => setFormData({ ...formData, role_id: val })}>
                                <SelectTrigger><SelectValue placeholder="Rol" /></SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.id.toString()}>
                                            <div className="flex items-center gap-2">{getRoleIcon(role.name)} {role.name}</div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* ESTADO (is_active) */}
                        <div className="space-y-2">
                            <Label>Estado</Label>
                            <Select value={formData.is_active} onValueChange={(val) => setFormData({ ...formData, is_active: val })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">
                                        <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> Activo</div>
                                    </SelectItem>
                                    <SelectItem value="0">
                                        <div className="flex items-center gap-2 text-slate-400"><XCircle className="w-4 h-4" /> Inactivo</div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-blue-700 hover:bg-blue-800">
                        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Crear
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
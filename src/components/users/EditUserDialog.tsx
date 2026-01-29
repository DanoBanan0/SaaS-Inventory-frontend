"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserCog, Shield, Code, CheckCircle, XCircle, User } from "lucide-react";
import Swal from "sweetalert2";

interface EditUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: any;
    onSuccess: () => void;
}

export function EditUserDialog({ open, onOpenChange, user, onSuccess }: EditUserDialogProps) {
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role_id: "",
        is_active: "1"
    });

    useEffect(() => {
        if (open) {
            api.get("/roles")
                .then((res) => {
                    const allRoles = res.data;
                    const userStr = localStorage.getItem('user');
                    const currentUser = userStr ? JSON.parse(userStr) : null;
                    const myRoleName = currentUser?.role?.name?.toLowerCase() || "";

                    const visibleRoles = allRoles.filter((r: any) => {
                        const roleName = r.name.toLowerCase();
                        const isDevRole = roleName.includes('dev');
                        const amIDev = myRoleName.includes('dev');

                        if (isDevRole && !amIDev) return false;
                        return true;
                    });

                    setRoles(visibleRoles);
                })
                .catch(console.error);

            if (user) {
                setFormData({
                    name: user.name || "",
                    email: user.email || "",
                    password: "",
                    role_id: user.role_id ?? "",
                    is_active: user.is_active ? "1" : "0"
                });
            }
        }
    }, [open, user]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const payload: any = {
                ...formData,
                is_active: formData.is_active === "1"
            };
            if (!payload.password) delete payload.password;

            await api.put(`/users/${user.id}`, payload);

            Swal.fire({ icon: "success", title: "Actualizado", timer: 1500, showConfirmButton: false });
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            Swal.fire("Error", "No se pudo actualizar", "error");
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
                        <UserCog className="w-5 h-5 text-blue-600" />
                        Editar Usuario
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label>Nombre</Label>
                        <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-blue-700">Contraseña (Opcional)</Label>
                        <Input type="password" placeholder="Solo si deseas cambiarla" className="border-blue-200 bg-blue-50/50" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Rol</Label>
                            <Select value={formData.role_id} onValueChange={(val) => setFormData({ ...formData, role_id: val })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.id}>
                                            <div className="flex items-center gap-2">{getRoleIcon(role.name)} {role.name}</div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Estado</Label>
                            <Select value={formData.is_active} onValueChange={(val) => setFormData({ ...formData, is_active: val })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1"><div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> Activo</div></SelectItem>
                                    <SelectItem value="0"><div className="flex items-center gap-2 text-slate-400"><XCircle className="w-4 h-4" /> Inactivo</div></SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-blue-700 hover:bg-blue-800">
                        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Guardar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
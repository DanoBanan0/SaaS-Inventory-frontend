"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserCog, Mail, Briefcase, CheckCircle, XCircle } from "lucide-react";
import Swal from "sweetalert2";

interface EditEmployeeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employee: any;
    onSuccess: () => void;
}

export function EditEmployeeDialog({ open, onOpenChange, employee, onSuccess }: EditEmployeeDialogProps) {
    const [loading, setLoading] = useState(false);
    const [units, setUnits] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        unit_id: "",
        email: "",
        job_title: "",
        status: "1"
    });

    useEffect(() => {
        if (open) {
            api.get("/units").then(res => setUnits(res.data.data || res.data));
        }
        if (employee) {
            setFormData({
                name: employee.name,
                unit_id: employee.unit_id?.toString() || "",
                email: employee.email || "",
                job_title: employee.job_title || "",
                status: employee.status ? "1" : "0"
            });
        }
    }, [open, employee]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await api.put(`/employees/${employee.id}`, {
                ...formData,
                status: formData.status === "1"
            });

            Swal.fire({ icon: "success", title: "Actualizado", timer: 1500, showConfirmButton: false });
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            Swal.fire("Error", error.response?.data?.message || "No se pudo actualizar", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserCog className="w-5 h-5 text-blue-600" />
                        Editar Empleado
                    </DialogTitle>
                </DialogHeader>

                {/* Nombre */}
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label>Nombre Completo</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    {/* Cargo */}
                    <div className="space-y-2">
                        <Label>Cargo</Label>
                        <div className="relative">
                            <Briefcase className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Ej: Analista"
                                className="pl-8"
                                value={formData.job_title}
                                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Correo */}
                    <div className="space-y-2">
                        <Label>Correo Electrónico</Label>
                        <div className="relative">
                            <Mail className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                type="email"
                                className="pl-8"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Unidad */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Unidad</Label>
                            <Select value={formData.unit_id} onValueChange={(val) => setFormData({ ...formData, unit_id: val })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {units.map((unit) => (
                                        <SelectItem key={unit.id} value={unit.id.toString()}>
                                            {unit.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Estado */}
                        <div className="space-y-2">
                            <Label>Estado</Label>
                            <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">
                                        <div className="flex items-center gap-2 text-green-600">
                                            <CheckCircle className="w-4 h-4" /> Activo
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="0">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <XCircle className="w-4 h-4" /> Inactivo
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-blue-700 hover:bg-blue-800">
                        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Guardar Cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
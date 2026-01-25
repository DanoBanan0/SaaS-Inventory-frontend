"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserPlus, Briefcase, Mail } from "lucide-react";
import Swal from "sweetalert2";

interface CreateEmployeeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateEmployeeDialog({ open, onOpenChange, onSuccess }: CreateEmployeeDialogProps) {
    const [loading, setLoading] = useState(false);
    const [units, setUnits] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        unit_id: "",
        email: "",      // <--- Campo Nuevo
        job_title: "",  // <--- Campo Nuevo
        status: "1"     // "1" visualmente es Activo
    });

    useEffect(() => {
        if (open) {
            api.get("/units").then(res => setUnits(res.data.data || res.data));
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!formData.name || !formData.unit_id) {
            Swal.fire("Faltan datos", "El nombre y la unidad son obligatorios", "warning");
            return;
        }

        setLoading(true);
        try {
            // Convertimos el "1" o "0" del select a true/false para Laravel
            await api.post("/employees", {
                ...formData,
                status: formData.status === "1"
            });

            Swal.fire({ icon: "success", title: "Empleado Registrado", timer: 1500, showConfirmButton: false });

            // Limpiamos el formulario
            setFormData({ name: "", unit_id: "", email: "", job_title: "", status: "1" });
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            Swal.fire("Error", error.response?.data?.message || "No se pudo crear", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-blue-600" />
                        Nuevo Empleado
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {/* Fila 1: Nombre y Cargo */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nombre Completo</Label>
                            <Input
                                placeholder="Ej: Juan Pérez"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Cargo / Puesto</Label>
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
                    </div>

                    {/* Fila 2: Correo */}
                    <div className="space-y-2">
                        <Label>Correo Electrónico</Label>
                        <div className="relative">
                            <Mail className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                type="email"
                                placeholder="juan.perez@empresa.com"
                                className="pl-8"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Fila 3: Unidad */}
                    <div className="space-y-2">
                        <Label>Unidad / Departamento</Label>
                        <Select onValueChange={(val) => setFormData({ ...formData, unit_id: val })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione unidad..." />
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
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-blue-700 hover:bg-blue-800">
                        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Guardar Empleado
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
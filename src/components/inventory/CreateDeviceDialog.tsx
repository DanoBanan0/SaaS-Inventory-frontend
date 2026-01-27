"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import Swal from "sweetalert2";

interface CreateDeviceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: any;
    onSuccess: () => void;
}

export function CreateDeviceDialog({ open, onOpenChange, category, onSuccess }: CreateDeviceDialogProps) {
    const [loading, setLoading] = useState(false);
    const [purchases, setPurchases] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        inventory_code: "",
        serial_number: "",
        brand: "",
        model: "",
        purchase_id: "",
        employee_id: "unassigned",
        status: "available",
        comments: "",
        specs: {} as Record<string, any>
    });

    useEffect(() => {
        if (open) {
            const fetchData = async () => {
                try {
                    const [resPurchases, resEmployees] = await Promise.all([
                        api.get("/purchases"),
                        api.get("/employees")
                    ]);
                    setPurchases(resPurchases.data.data || resPurchases.data);
                    setEmployees(resEmployees.data.data || resEmployees.data);
                } catch (error) {
                    console.error("Error cargando listas", error);
                }
            };
            fetchData();
        }
    }, [open]);

    const handleEmployeeChange = (val: string) => {
        setFormData(prev => ({
            ...prev,
            employee_id: val,
            status: val !== "unassigned" ? "assigned" : "available"
        }));
    };

    const handleSpecChange = (key: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            specs: { ...prev.specs, [key]: value }
        }));
    };

    const handleSubmit = async () => {
        if (!formData.inventory_code || !formData.purchase_id) {
            Swal.fire("Requerido", "El código y la factura son obligatorios", "warning");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                category_id: category.id,
                employee_id: formData.employee_id === "unassigned" ? null : formData.employee_id,
            };

            await api.post("/devices", payload);

            Swal.fire({
                icon: "success",
                title: "Guardado",
                timer: 1000,
                showConfirmButton: false,
            });

            onSuccess();
            onOpenChange(false);
            setFormData({
                ...formData,
                inventory_code: "", serial_number: "", comments: "",
                employee_id: "unassigned", status: "available", specs: {}
            });

        } catch (error: any) {
            Swal.fire("Error", error.response?.data?.message || "Error al guardar", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Registrar {category?.name}</DialogTitle>
                </DialogHeader>

                <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">

                    <div className="space-y-1">
                        <Label>Asignar a Empleado</Label>
                        <Select value={formData.employee_id} onValueChange={handleEmployeeChange}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unassigned" className="text-slate-500">-- Sin asignar (Bodega) --</SelectItem>
                                {employees.map(emp => (
                                    <SelectItem key={emp.id} value={emp.id.toString()}>
                                        {emp.name} {emp.unit ? `(${emp.unit.name})` : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label>Código Inventario *</Label>
                        <Input
                            value={formData.inventory_code}
                            onChange={(e) => setFormData({ ...formData, inventory_code: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Marca</Label>
                        <Input
                            value={formData.brand}
                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Modelo</Label>
                        <Input
                            value={formData.model}
                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Número de Serie *</Label>
                        <Input
                            value={formData.serial_number}
                            onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label>Factura de Origen *</Label>
                        <Select onValueChange={(val) => setFormData({ ...formData, purchase_id: val })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                                {purchases.map(p => (
                                    <SelectItem key={p.id} value={p.id.toString()}>
                                        {p.invoice_number} - {p.provider}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {category?.fields && category.fields.map((field: any) => (
                        <div key={field.key} className="space-y-1">
                            <Label>
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                            </Label>
                            <Input
                                value={formData.specs[field.key] || ""}
                                onChange={(e) => handleSpecChange(field.key, e.target.value)}
                            />
                        </div>
                    ))}

                    <div className="space-y-1">
                        <Label>Estado Actual</Label>
                        <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                            <SelectTrigger className={
                                formData.status === 'available' ? "text-green-600 font-medium" :
                                    formData.status === 'assigned' ? "text-blue-600 font-medium" :
                                        formData.status === 'maintenance' ? "text-orange-600 font-medium" : "text-red-600 font-medium"
                            }>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="available">🟢 Disponible</SelectItem>
                                <SelectItem value="assigned">🔵 Asignado</SelectItem>
                                <SelectItem value="maintenance">🟠 En Mantenimiento</SelectItem>
                                <SelectItem value="retired">🔴 Descargo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-1">
                        <Label>Comentarios</Label>
                        <Textarea
                            className="resize-none h-20"
                            value={formData.comments}
                            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                        />
                    </div>

                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit} className="bg-blue-700 hover:bg-blue-800">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
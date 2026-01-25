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

interface EditDeviceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: any;
    device: any; // El dispositivo a editar
    onSuccess: () => void;
}

export function EditDeviceDialog({ open, onOpenChange, category, device, onSuccess }: EditDeviceDialogProps) {
    const [loading, setLoading] = useState(false);
    const [purchases, setPurchases] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);

    // Estado del formulario
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

    // 1. Cargar Listas (Compras/Empleados) al montar
    useEffect(() => {
        if (open) {
            const fetchLists = async () => {
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
            fetchLists();
        }
    }, [open]);

    // 2. RELLENAR DATOS CUANDO LLEGA EL DISPOSITIVO (La Magia ✨)
    useEffect(() => {
        if (device) {
            setFormData({
                inventory_code: device.inventory_code || "",
                serial_number: device.serial_number || "",
                brand: device.brand || "",
                model: device.model || "",
                purchase_id: device.purchase_id ? device.purchase_id.toString() : "",
                employee_id: device.employee_id ? device.employee_id.toString() : "unassigned",
                status: device.status || "available",
                comments: device.comments || "",
                specs: device.specs || {} // Cargamos las specs existentes
            });
        }
    }, [device]);

    const handleSpecChange = (key: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            specs: { ...prev.specs, [key]: value }
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const payload = {
                ...formData,
                employee_id: formData.employee_id === "unassigned" ? null : formData.employee_id,
            };

            // PUT para actualizar
            await api.put(`/devices/${device.id}`, payload);

            Swal.fire({
                icon: "success",
                title: "Actualizado",
                text: "Los datos del dispositivo se han guardado.",
                timer: 1500,
                showConfirmButton: false
            });

            onSuccess();
            onOpenChange(false);

        } catch (error: any) {
            console.error(error);
            Swal.fire("Error", "No se pudo actualizar el dispositivo", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar {category?.name} - {formData.inventory_code}</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">

                    {/* Columna Izquierda */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-blue-900 border-b pb-1">Identificación</h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Código Inventario</Label>
                                <Input value={formData.inventory_code} onChange={(e) => setFormData({ ...formData, inventory_code: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Número de Serie</Label>
                                <Input value={formData.serial_number} onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Marca</Label>
                                <Input value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Modelo</Label>
                                <Input value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Origen (Factura)</Label>
                            <Select value={formData.purchase_id} onValueChange={(val) => setFormData({ ...formData, purchase_id: val })}>
                                <SelectTrigger><SelectValue placeholder="Seleccione factura..." /></SelectTrigger>
                                <SelectContent>
                                    {purchases.map(p => (
                                        <SelectItem key={p.id} value={p.id.toString()}>{p.invoice_number} - {p.provider}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Columna Derecha */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-blue-900 border-b pb-1">Estado y Asignación</h3>

                        <div className="space-y-2">
                            <Label>Estado</Label>
                            <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="available">🟢 Disponible</SelectItem>
                                    <SelectItem value="assigned">🔵 Asignado</SelectItem>
                                    <SelectItem value="maintenance">🟠 En Mantenimiento</SelectItem>
                                    <SelectItem value="retired">🔴 Retirado / Dañado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Asignado a</Label>
                            <Select value={formData.employee_id} onValueChange={(val) => setFormData({ ...formData, employee_id: val })}>
                                <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned" className="text-slate-500">-- En Bodega --</SelectItem>
                                    {employees.map(emp => (
                                        <SelectItem key={emp.id} value={emp.id.toString()}>{emp.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Comentarios</Label>
                            <Textarea
                                className="resize-none h-24"
                                value={formData.comments}
                                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Especificaciones Dinámicas */}
                    {category?.fields && category.fields.length > 0 && (
                        <div className="md:col-span-2 mt-2 pt-4 border-t">
                            <h3 className="text-sm font-semibold text-slate-700 mb-3">Especificaciones Técnicas</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {category.fields.map((field: any) => (
                                    <div key={field.key} className="space-y-1">
                                        <Label className="text-xs text-slate-500">{field.label}</Label>
                                        {field.type === 'boolean' ? (
                                            <Select
                                                value={formData.specs[field.key] || ""}
                                                onValueChange={(val) => handleSpecChange(field.key, val)}
                                            >
                                                <SelectTrigger className="h-9"><SelectValue placeholder="-" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Sí">Sí</SelectItem>
                                                    <SelectItem value="No">No</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Input
                                                className="h-9"
                                                type={field.type === 'number' ? 'number' : 'text'}
                                                value={formData.specs[field.key] || ""}
                                                onChange={(e) => handleSpecChange(field.key, e.target.value)}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit} className="bg-blue-700 hover:bg-blue-800">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar Cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
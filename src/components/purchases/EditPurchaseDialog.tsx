"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Pencil, Calendar as CalendarIcon, DollarSign } from "lucide-react"; // Importamos DollarSign
import Swal from "sweetalert2";

interface EditPurchaseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    purchase: any;
    onSuccess: () => void;
}

export function EditPurchaseDialog({ open, onOpenChange, purchase, onSuccess }: EditPurchaseDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        provider: "",
        invoice_number: "",
        purchase_date: "",
        total_amount: "" // <--- 1. Agregamos el estado para el monto
    });

    // 2. Al abrir el modal, rellenamos TODOS los campos (incluido el monto)
    useEffect(() => {
        if (purchase) {
            setFormData({
                provider: purchase.provider || "",
                invoice_number: purchase.invoice_number || "",
                purchase_date: purchase.purchase_date ? purchase.purchase_date.split('T')[0] : "",
                total_amount: purchase.total_amount || "" // <--- Cargamos el monto existente
            });
        }
    }, [purchase]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await api.put(`/purchases/${purchase.id}`, formData);

            Swal.fire({
                icon: "success",
                title: "Actualizado",
                timer: 1500,
                showConfirmButton: false
            });

            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            // Mejoramos el mensaje de error para saber qué está fallando
            const msg = error.response?.data?.message || "No se pudo actualizar";
            Swal.fire("Error", msg, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Pencil className="w-5 h-5 text-blue-600" />
                        Editar Factura
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label>Proveedor</Label>
                        <Input
                            value={formData.provider}
                            onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Número de Factura</Label>
                        <Input
                            value={formData.invoice_number}
                            onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                        />
                    </div>

                    {/* 3. Agregamos el Input de Monto Total */}
                    <div className="space-y-2">
                        <Label>Monto Total ($)</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                type="number"
                                step="0.01"
                                className="pl-8"
                                value={formData.total_amount}
                                onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Fecha de Compra</Label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                type="date"
                                className="pl-8"
                                value={formData.purchase_date}
                                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                            />
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
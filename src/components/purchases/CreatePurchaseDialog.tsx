"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShoppingCart, Calendar as CalendarIcon, DollarSign } from "lucide-react";
import Swal from "sweetalert2";

interface CreatePurchaseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreatePurchaseDialog({ open, onOpenChange, onSuccess }: CreatePurchaseDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        provider: "",
        invoice_number: "",
        purchase_date: new Date().toISOString().split('T')[0],
        total_amount: "" // <--- Nuevo estado inicial
    });

    const handleSubmit = async () => {
        if (!formData.provider || !formData.invoice_number || !formData.total_amount) {
            Swal.fire("Campos vacíos", "Por favor complete todos los campos obligatorios", "warning");
            return;
        }

        setLoading(true);
        try {
            await api.post("/purchases", formData);

            Swal.fire({
                icon: "success",
                title: "Compra Registrada",
                timer: 1500,
                showConfirmButton: false
            });

            setFormData({
                provider: "",
                invoice_number: "",
                purchase_date: new Date().toISOString().split('T')[0],
                total_amount: ""
            });
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
                        <ShoppingCart className="w-5 h-5 text-blue-600" />
                        Registrar Nueva Compra
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label>Proveedor</Label>
                        <Input
                            placeholder="Ej: Office Depot, Dell Inc..."
                            value={formData.provider}
                            onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Número de Factura / Ticket</Label>
                        <Input
                            placeholder="Ej: FAC-001234"
                            value={formData.invoice_number}
                            onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                        />
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

                <div className="space-y-2">
                    <Label>Monto Total ($)</Label>
                    <div className="relative">
                        <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="pl-8"
                            value={formData.total_amount}
                            onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-blue-700 hover:bg-blue-800">
                        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Guardar Factura
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
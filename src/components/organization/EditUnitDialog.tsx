"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Building2 } from "lucide-react";
import Swal from "sweetalert2";

interface EditUnitDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    unit: any; // La unidad a editar
    onSuccess: () => void;
}

export function EditUnitDialog({ open, onOpenChange, unit, onSuccess }: EditUnitDialogProps) {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");

    // Rellenar el nombre cuando abrimos el modal
    useEffect(() => {
        if (unit) {
            setName(unit.name);
        }
    }, [unit]);

    const handleSubmit = async () => {
        if (!name.trim()) return;
        setLoading(true);

        try {
            await api.put(`/units/${unit.id}`, { name });

            Swal.fire({
                icon: "success",
                title: "Unidad Actualizada",
                timer: 1500,
                showConfirmButton: false
            });

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
                        <Building2 className="w-5 h-5 text-blue-600" />
                        Editar Unidad
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-2">
                    <Label>Nombre del Departamento / Unidad</Label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={!name || loading} className="bg-blue-700 hover:bg-blue-800">
                        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Guardar Cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
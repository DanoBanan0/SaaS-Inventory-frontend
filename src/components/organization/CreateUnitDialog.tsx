"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Building2 } from "lucide-react";
import Swal from "sweetalert2";

interface CreateUnitDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateUnitDialog({ open, onOpenChange, onSuccess }: CreateUnitDialogProps) {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");

    const handleSubmit = async () => {
        if (!name.trim()) return;
        setLoading(true);

        try {
            await api.post("/units", { name });

            Swal.fire({
                icon: "success",
                title: "Unidad Creada",
                timer: 1500,
                showConfirmButton: false
            });

            setName("");
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
                        <Building2 className="w-5 h-5 text-blue-600" />
                        Nueva Unidad Organizativa
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-2">
                    <Label>Nombre del Departamento / Unidad</Label>
                    <Input
                        autoFocus
                        placeholder="Ej: Recursos Humanos, Informática..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={!name || loading} className="bg-blue-700 hover:bg-blue-800">
                        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Guardar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
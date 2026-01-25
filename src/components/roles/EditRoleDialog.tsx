"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock } from "lucide-react";
import Swal from "sweetalert2";

interface EditRoleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    role: any;
    onSuccess: () => void;
}

export function EditRoleDialog({ open, onOpenChange, role, onSuccess }: EditRoleDialogProps) {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");

    useEffect(() => {
        if (role) setName(role.name);
    }, [role]);

    const handleSubmit = async () => {
        if (!name.trim()) return;
        setLoading(true);

        try {
            await api.put(`/roles/${role.id}`, { name });

            Swal.fire({ icon: "success", title: "Rol Actualizado", timer: 1500, showConfirmButton: false });
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
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-blue-600" />
                        Editar Rol
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-2">
                    <Label>Nombre del Rol</Label>
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
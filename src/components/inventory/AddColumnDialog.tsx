"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Columns } from "lucide-react";
import Swal from "sweetalert2";

interface AddColumnDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categoryId: string | number;
    onSuccess: () => void;
}

export function AddColumnDialog({ open, onOpenChange, categoryId, onSuccess }: AddColumnDialogProps) {
    const [loading, setLoading] = useState(false);
    const [label, setLabel] = useState("");

    const handleSubmit = async () => {
        if (!label.trim()) return;
        setLoading(true);

        try {
            await api.post(`/categories/${categoryId}/fields`, {
                label: label,
                type: "text",
                required: false
            });

            Swal.fire({
                icon: "success",
                title: "Columna Agregada",
                timer: 1000,
                showConfirmButton: false
            });

            setLabel("");
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error(error);
            Swal.fire("Error", "No se pudo agregar la columna", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Columns className="w-5 h-5 text-blue-600" />
                        Agregar Columna
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label>Nombre del Campo</Label>
                        <Input
                            autoFocus
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={!label || loading} className="bg-blue-700 hover:bg-blue-800">
                        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Agregar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
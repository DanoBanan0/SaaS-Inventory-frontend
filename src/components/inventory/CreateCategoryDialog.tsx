"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Loader2, List } from "lucide-react";
import Swal from "sweetalert2";

interface CreateCategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

interface Field {
    label: string;
    key: string;
    type: string;
    required: boolean;
}

export function CreateCategoryDialog({ open, onOpenChange, onSuccess }: CreateCategoryDialogProps) {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [fields, setFields] = useState<Field[]>([]);

    // Agregar campo (Por defecto ahora siempre es "text" / string)
    const addField = () => {
        setFields([...fields, { label: "", key: "", type: "text", required: false }]);
    };

    const updateField = (index: number, value: string) => {
        const newFields = [...fields];
        // Actualizamos el Label
        newFields[index].label = value;

        // Generamos la Key automática (ej: "Color Vehículo" -> "color_vehiculo")
        newFields[index].key = value
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quitar tildes
            .replace(/[^a-z0-9]/g, "_") // Solo letras y números
            .replace(/_+/g, "_"); // Evitar guiones dobles

        setFields(newFields);
    };

    const removeField = (index: number) => {
        setFields(fields.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!name.trim()) return;

        // Validar que no haya campos vacíos
        if (fields.some(f => !f.label.trim())) {
            Swal.fire("Atención", "Define el nombre de todas las características o elimina las vacías.", "warning");
            return;
        }

        setLoading(true);

        try {
            await api.post("/categories", {
                name,
                fields
            });

            Swal.fire({
                icon: "success",
                title: "Categoría creada",
                text: `"${name}" registrada correctamente.`,
                timer: 1500,
                showConfirmButton: false
            });

            setName("");
            setFields([]);
            onSuccess();
            onOpenChange(false);

        } catch (error: any) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.response?.data?.message || "No se pudo crear la categoría"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Nueva Categoría</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Nombre de la Categoría */}
                    <div className="space-y-2">
                        <Label className="text-slate-700 font-semibold">Nombre de Categoría</Label>
                        <Input
                            autoFocus
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="text-lg"
                        />
                    </div>

                    {/* Constructor de Campos */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between border-b pb-2">
                            <div className="flex items-center gap-2">
                                <List className="w-4 h-4 text-blue-600" />
                                <Label className="text-slate-700 font-medium">Características Extras</Label>
                            </div>
                            <Button size="sm" variant="ghost" onClick={addField} className="text-blue-700 hover:text-blue-800 hover:bg-blue-50">
                                <Plus className="w-4 h-4 mr-1" /> Agregar
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {fields.map((field, index) => (
                                <div key={index} className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                                    <div className="flex-1">
                                        <Input
                                            value={field.label}
                                            onChange={(e) => updateField(index, e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                                        onClick={() => removeField(index)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={loading || !name} className="bg-blue-700 hover:bg-blue-800">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Guardar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
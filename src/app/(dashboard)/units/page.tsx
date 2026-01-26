"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Users, Trash2, Pencil } from "lucide-react";
import Swal from "sweetalert2";
import { CreateUnitDialog } from "@/components/organization/CreateUnitDialog";
import { EditUnitDialog } from "@/components/organization/EditUnitDialog";
import { DataFilters } from "@/components/common/DataFilters";

export default function UnitsPage() {
    const [units, setUnits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Estados de Modales
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<any>(null);

    const fetchUnits = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/units?search=${search}`);
            setUnits(res.data.data || res.data);
        } catch (error) {
            console.error("Error fetching units", error);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUnits();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchUnits]);

    // Función para abrir el modal de edición
    const handleEdit = (unit: any) => {
        setSelectedUnit(unit);
        setIsEditOpen(true);
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: "¿Eliminar Unidad?",
            text: "Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/units/${id}`);
                    Swal.fire("Eliminado", "La unidad ha sido eliminada.", "success");
                    fetchUnits();
                } catch (error: any) {
                    Swal.fire("Error", error.response?.data?.message || "No se pudo eliminar", "error");
                }
            }
        });
    };

    const clearFilters = () => {
        setSearch("");
    };

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Building2 className="h-6 w-6 text-blue-600" />
                        Unidades Organizativas
                    </h1>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-700 hover:bg-blue-800">
                    <Plus className="mr-2 h-4 w-4" /> Nueva Unidad
                </Button>
            </div>

            {/* BUSCADOR IMPLEMENTADO CON DATAFILTERS */}
            <DataFilters
                searchValue={search}
                onSearchChange={setSearch}
                clearColSpan="md:col-span-1"
                hasActiveFilters={!!search}
                onClear={clearFilters}
            />

            {/* TABLA */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-100">
                            <TableRow>
                                <TableHead className="font-bold text-slate-700">Nombre de la Unidad</TableHead>
                                <TableHead className="font-bold text-slate-700 text-center">Empleados Activos</TableHead>
                                <TableHead className="text-right font-bold text-slate-700 pr-6">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={3} className="h-24 text-center">Cargando...</TableCell></TableRow>
                            ) : units.length === 0 ? (
                                <TableRow><TableCell colSpan={3} className="h-24 text-center text-slate-500">No hay unidades registradas.</TableCell></TableRow>
                            ) : (
                                units.map((unit) => (
                                    <TableRow key={unit.id} className="hover:bg-slate-50/50">
                                        <TableCell className="font-medium text-lg text-slate-800">
                                            {unit.name}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                                <Users className="w-3 h-3 mr-1" />
                                                {unit.employees_count || 0}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="text-right space-x-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                onClick={() => handleEdit(unit)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDelete(unit.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <CreateUnitDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onSuccess={fetchUnits}
            />

            <EditUnitDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                unit={selectedUnit}
                onSuccess={fetchUnits}
            />
        </div>
    );
}
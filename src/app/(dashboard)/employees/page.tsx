"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Search, Trash2, Pencil, Laptop, Briefcase } from "lucide-react";
import Swal from "sweetalert2";
import { CreateEmployeeDialog } from "@/components/employees/CreateEmployeeDialog";
import { EditEmployeeDialog } from "@/components/employees/EditEmployeeDialog";
import { DataFilters } from "@/components/common/DataFilters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [unitFilter, setUnitFilter] = useState("");
    const [units, setUnits] = useState<any[]>([]);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedEmp, setSelectedEmp] = useState<any>(null);

    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const res = await api.get("/units");
                const list = Array.isArray(res.data) ? res.data : (res.data.data || []);
                setUnits(list);
            } catch (error) {
                console.error("Error cargando unidades", error);
                setUnits([]);
            }
        };
        fetchUnits();
    }, []);

    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append("search", search);

            if (unitFilter && unitFilter !== "all") params.append("unit_id", unitFilter);

            const res = await api.get(`/employees?${params.toString()}`);
            setEmployees(res.data.data || res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [search, unitFilter]);

    useEffect(() => {
        const timer = setTimeout(() => fetchEmployees(), 300);
        return () => clearTimeout(timer);
    }, [fetchEmployees]);

    const handleEdit = (emp: any) => {
        setSelectedEmp(emp);
        setIsEditOpen(true);
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: "¿Dar de baja?",
            text: "Si tiene equipos asignados, no se podrá eliminar.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            confirmButtonColor: "#d33"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/employees/${id}`);
                    Swal.fire("Eliminado", "Empleado eliminado correctamente.", "success");
                    fetchEmployees();
                } catch (error: any) {
                    Swal.fire("Error", error.response?.data?.message || "Error al eliminar", "error");
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
                        <Users className="h-6 w-6 text-blue-600" />
                        Directorio de Empleados
                    </h1>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-700 hover:bg-blue-800">
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Empleado
                </Button>
            </div>

            {/* BUSCADOR */}
            <DataFilters
                searchValue={search}
                onSearchChange={setSearch}
                searchColSpan="md:col-span-3 lg:col-span-3"
                clearColSpan="md:col-span-1"
                hasActiveFilters={!!(search || unitFilter)}
                onClear={clearFilters}
            >
                <div className="col-span-1 md:col-span-2 lg:col-span-2 space-y-1">
                    <span className="text-xs font-medium text-slate-500 ml-1">Filtrar por Unidad</span>
                    <Select
                        value={unitFilter || "all"}
                        onValueChange={(val) => setUnitFilter(val === "all" ? "" : val)}
                    >
                        <SelectTrigger className="bg-white w-full">
                            <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {Array.isArray(units) && units.map((unit) => (
                                <SelectItem key={unit.id} value={unit.id.toString()}>
                                    {unit.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </DataFilters>

            {/* TABLA */}
            <Card>
                <CardContent className="p-0 overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-100">
                            <TableRow>
                                <TableHead className="font-bold text-slate-700">Empleado / Email</TableHead>
                                <TableHead className="font-bold text-slate-700">Cargo</TableHead>
                                <TableHead className="font-bold text-slate-700">Unidad</TableHead>
                                <TableHead className="font-bold text-slate-700">Estado</TableHead>
                                <TableHead className="font-bold text-slate-700 text-center">Equipos</TableHead>
                                <TableHead className="text-right font-bold text-slate-700 pr-6">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} className="h-24 text-center">Cargando...</TableCell></TableRow>
                            ) : employees.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="h-24 text-center text-slate-500">No se encontraron empleados.</TableCell></TableRow>
                            ) : (
                                employees.map((emp) => (
                                    <TableRow key={emp.id} className="hover:bg-slate-50/50">

                                        {/* NOMBRE Y EMAIL JUNTOS */}
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-900">{emp.name}</span>
                                                <span className="text-xs text-slate-500">{emp.email || "-"}</span>
                                            </div>
                                        </TableCell>

                                        {/* CARGO */}
                                        <TableCell className="text-slate-600 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Briefcase className="w-3 h-3 text-slate-400" />
                                                {emp.job_title || "N/A"}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <Badge variant="outline" className="text-slate-600 border-slate-300">
                                                {emp.unit?.name || "Sin Unidad"}
                                            </Badge>
                                        </TableCell>

                                        <TableCell>
                                            {/* Usamos el booleano 'status' (true/false) */}
                                            <Badge className={emp.status ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"}>
                                                {emp.status ? "Activo" : "Inactivo"}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-slate-600 font-medium">
                                                <Laptop className="w-4 h-4 text-blue-500" />
                                                {emp.devices_count || 0}
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-right space-x-1">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(emp)}>
                                                <Pencil className="w-4 h-4 text-slate-400 hover:text-blue-600" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(emp.id)}>
                                                <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <CreateEmployeeDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onSuccess={fetchEmployees}
            />

            <EditEmployeeDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                employee={selectedEmp}
                onSuccess={fetchEmployees}
            />
        </div>
    );
}
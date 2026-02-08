"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Users, Plus, Search, Trash2, Pencil, Laptop, Briefcase,
    ChevronLeft, ChevronRight // Iconos para paginación
} from "lucide-react";
import Swal from "sweetalert2";
import { CreateEmployeeDialog } from "@/components/employees/CreateEmployeeDialog";
import { EditEmployeeDialog } from "@/components/employees/EditEmployeeDialog";
import { DataFilters } from "@/components/common/DataFilters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // --- NUEVO ESTADO PARA PAGINACIÓN ---
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        from: 0,
        to: 0
    });

    const [search, setSearch] = useState("");
    const [unitFilter, setUnitFilter] = useState("");
    const [units, setUnits] = useState<any[]>([]);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedEmp, setSelectedEmp] = useState<any>(null);

    // Carga inicial de unidades
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

    // --- CARGA DE EMPLEADOS CON PAGINACIÓN ---
    const fetchEmployees = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append("page", page.toString()); // Enviamos la página al backend

            if (search) params.append("search", search);
            if (unitFilter && unitFilter !== "all") params.append("unit_id", unitFilter);

            const res = await api.get(`/employees?${params.toString()}`);

            // Laravel paginate devuelve: { data: [...], current_page: 1, ... }
            // Si el backend aún no tiene paginate(), esto fallará, asegúrate de cambiar el backend primero.
            setEmployees(res.data.data || []);

            setPagination({
                current_page: res.data.current_page || 1,
                last_page: res.data.last_page || 1,
                total: res.data.total || 0,
                from: res.data.from || 0,
                to: res.data.to || 0
            });

        } catch (error) {
            console.error(error);
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    }, [search, unitFilter]);

    // Efecto Debounce para búsqueda (Vuelve a página 1)
    useEffect(() => {
        const timer = setTimeout(() => fetchEmployees(1), 300);
        return () => clearTimeout(timer);
    }, [fetchEmployees]);

    // --- MANEJO DE CAMBIO DE PÁGINA ---
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            fetchEmployees(newPage);
        }
    };

    const handleEdit = (emp: any) => {
        setSelectedEmp(emp);
        setIsEditOpen(true);
    };

    const handleDelete = (id: string) => {
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
                    fetchEmployees(pagination.current_page); // Recargamos la misma página
                } catch (error: any) {
                    Swal.fire("Error", error.response?.data?.message || "Error al eliminar", "error");
                }
            }
        });
    };

    const clearFilters = () => {
        setSearch("");
        setUnitFilter(""); // También limpiamos el filtro de unidad
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
                    <span className="text-xs font-medium text-slate-500 ml-1">Unidad</span>
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
                                <TableRow><TableCell colSpan={6} className="h-24 text-center text-blue-600">Cargando...</TableCell></TableRow>
                            ) : employees.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="h-24 text-center text-slate-500">No se encontraron empleados.</TableCell></TableRow>
                            ) : (
                                employees.map((emp) => (
                                    <TableRow key={emp.id} className="hover:bg-slate-50/50">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-900">{emp.name}</span>
                                                <span className="text-xs text-slate-500">{emp.email || "-"}</span>
                                            </div>
                                        </TableCell>
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

                    {/* --- FOOTER PAGINACIÓN --- */}
                    <div className="flex items-center justify-end p-4 border-t border-slate-100 bg-slate-50/30 gap-2">
                        <div className="flex items-center gap-1 mr-4">
                            <span className="text-xs text-slate-500">
                                Mostrando {pagination.from || 0} - {pagination.to || 0} de {pagination.total}
                            </span>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.current_page - 1)}
                            disabled={pagination.current_page === 1 || loading}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <span className="text-xs font-medium text-slate-700 w-16 text-center">
                            Pág {pagination.current_page} de {pagination.last_page}
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.current_page + 1)}
                            disabled={pagination.current_page === pagination.last_page || loading}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                </CardContent>
            </Card>

            <CreateEmployeeDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onSuccess={() => fetchEmployees(1)} // Al crear, volvemos a la página 1
            />

            <EditEmployeeDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                employee={selectedEmp}
                onSuccess={() => fetchEmployees(pagination.current_page)} // Al editar, nos quedamos en la misma
            />
        </div>
    );
}
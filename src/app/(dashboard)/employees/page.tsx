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

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedEmp, setSelectedEmp] = useState<any>(null);

    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/employees?search=${search}`);
            setEmployees(res.data.data || res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [search]);

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

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Users className="h-6 w-6 text-blue-600" />
                        Directorio de Empleados
                    </h1>
                    <p className="text-slate-500 text-sm">Gestión de personal y asignaciones</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-700 hover:bg-blue-800">
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Empleado
                </Button>
            </div>

            {/* BUSCADOR */}
            <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar por nombre, cargo o email..."
                            className="pl-8 bg-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

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
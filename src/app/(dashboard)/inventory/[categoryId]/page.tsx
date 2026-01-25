"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, HardDrive, Calendar, Columns, Search, X, Pencil } from "lucide-react";
import { CreateDeviceDialog } from "@/components/inventory/CreateDeviceDialog";
import { AddColumnDialog } from "@/components/inventory/AddColumnDialog";
import { EditDeviceDialog } from "@/components/inventory/EditDeviceDialog";

export default function CategoryDetailPage() {
    const { categoryId } = useParams();
    const router = useRouter();

    const [category, setCategory] = useState<any>(null);
    const [devices, setDevices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados Modales
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState<any>(null);

    // Estados Filtros
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [unitFilter, setUnitFilter] = useState("");

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleString("es-SV", {
            day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
        });
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (!category) {
                const catRes = await api.get(`/categories/${categoryId}`);
                setCategory(catRes.data);
            }

            const params = new URLSearchParams();
            params.append('category_id', categoryId as string);

            if (searchText) params.append('search', searchText);
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (unitFilter) params.append('unit', unitFilter);

            const devRes = await api.get(`/devices?${params.toString()}`);
            setDevices(devRes.data.data || devRes.data);

        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    }, [categoryId, searchText, statusFilter, unitFilter, category]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (categoryId) fetchData();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchData, categoryId]);

    const clearFilters = () => {
        setSearchText("");
        setStatusFilter("all");
        setUnitFilter("");
    };

    const handleEditClick = (device: any) => {
        setSelectedDevice(device);
        setIsEditOpen(true);
    };

    if (loading && !category) return <div className="p-8 text-center">Cargando sistema...</div>;
    if (!category && !loading) return <div className="p-8 text-center text-red-500">Categoría no encontrada</div>;

    return (
        <div className="space-y-6">
            {/* 1. HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <HardDrive className="h-6 w-6 text-blue-600" />
                            {category?.name || "Cargando..."}
                        </h1>
                        <p className="text-slate-500 text-sm">Gestión de dispositivos</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsAddColumnOpen(true)}
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                        <Columns className="mr-2 h-4 w-4" /> Agregar Columna
                    </Button>

                    <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-700 hover:bg-blue-800">
                        <Plus className="mr-2 h-4 w-4" /> Registrar {category?.name}
                    </Button>
                </div>
            </div>

            {/* 2. BARRA DE FILTROS (GRID RESPONSIVO) */}
            <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">

                    {/* Buscador General (5 columnas) */}
                    <div className="col-span-1 md:col-span-5 space-y-1">
                        <span className="text-xs font-medium text-slate-500 ml-1">Búsqueda Inteligente</span>
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Serial, Modelo, Código, Empleado..."
                                className="pl-8 bg-white"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Filtro Unidad (3 columnas) */}
                    <div className="col-span-1 md:col-span-3 space-y-1">
                        <span className="text-xs font-medium text-slate-500 ml-1">Filtrar por Unidad</span>
                        <Input
                            placeholder="Ej: Informatica, Ventas..."
                            className="bg-white"
                            value={unitFilter}
                            onChange={(e) => setUnitFilter(e.target.value)}
                        />
                    </div>

                    {/* Filtro Estado (3 columnas) */}
                    <div className="col-span-1 md:col-span-3 space-y-1">
                        <span className="text-xs font-medium text-slate-500 ml-1">Estado</span>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Todos" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los estados</SelectItem>
                                <SelectItem value="available">🟢 Disponible</SelectItem>
                                <SelectItem value="assigned">🔵 Asignado</SelectItem>
                                <SelectItem value="maintenance">🟠 Mantenimiento</SelectItem>
                                <SelectItem value="retired">🔴 Retirado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Botón Limpiar (1 columna) */}
                    <div className="col-span-1 md:col-span-1 flex justify-center md:justify-start">
                        {(searchText || unitFilter || statusFilter !== 'all') && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={clearFilters}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                title="Limpiar filtros"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* 3. TABLA DE DATOS (RESTAURADA) */}
            <Card>
                <CardContent className="p-0 overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-100">
                            <TableRow>
                                <TableHead className="font-bold text-slate-700">Nombre</TableHead>
                                <TableHead className="font-bold text-slate-700">Unidad</TableHead>
                                <TableHead className="font-bold text-slate-700">Cód. Inventario</TableHead>
                                <TableHead className="font-bold text-slate-700">Marca</TableHead>
                                <TableHead className="font-bold text-slate-700">Modelo</TableHead>
                                <TableHead className="font-bold text-slate-700">Serial</TableHead>
                                {/* CAMPOS DINÁMICOS */}
                                {category?.fields?.map((field: any) => (
                                    <TableHead key={field.key} className="text-blue-700 font-semibold">{field.label}</TableHead>
                                ))}
                                <TableHead className="font-bold text-slate-700">Estado</TableHead>
                                <TableHead className="font-bold text-slate-700 w-[200px]">Comentario</TableHead>
                                <TableHead className="font-bold text-slate-700 whitespace-nowrap">Última Edición</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={11 + (category?.fields?.length || 0)} className="h-24 text-center text-blue-600">
                                        Cargando resultados...
                                    </TableCell>
                                </TableRow>
                            ) : devices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={11 + (category?.fields?.length || 0)} className="h-24 text-center text-slate-500">
                                        No se encontraron dispositivos con estos filtros.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                devices.map((device) => (
                                    <TableRow key={device.id} className="hover:bg-slate-50/80 transition-colors">
                                        <TableCell className="font-medium text-slate-900">
                                            {device.employee ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold border border-blue-200">
                                                        {device.employee.name.charAt(0)}
                                                    </div>
                                                    <span className="whitespace-nowrap">{device.employee.name}</span>
                                                </div>
                                            ) : (<span className="text-slate-400 text-xs italic">-- Sin Asignar --</span>)}
                                        </TableCell>
                                        <TableCell>
                                            {device.employee?.unit ? (
                                                <Badge variant="outline" className="text-slate-600 border-slate-300">
                                                    {device.employee.unit.name}
                                                </Badge>
                                            ) : (<span className="text-slate-300">-</span>)}
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">{device.inventory_code}</TableCell>
                                        <TableCell>{device.brand}</TableCell>
                                        <TableCell>{device.model}</TableCell>
                                        <TableCell className="text-xs text-slate-500 font-mono uppercase">{device.serial_number}</TableCell>
                                        {/* Celdas Dinámicas */}
                                        {category?.fields?.map((field: any) => (
                                            <TableCell key={field.key} className="text-slate-600">
                                                {device.specs?.[field.key] || "-"}
                                            </TableCell>
                                        ))}
                                        <TableCell>
                                            <Badge className={
                                                device.status === 'available' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                                                    device.status === 'assigned' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                                                        device.status === 'maintenance' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' :
                                                            'bg-red-100 text-red-700 hover:bg-red-200'
                                            }>
                                                {device.status === 'available' ? 'Disponible' :
                                                    device.status === 'assigned' ? 'Asignado' :
                                                        device.status === 'maintenance' ? 'Mantenimiento' : 'Retirado'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-500 max-w-[200px] truncate" title={device.comments}>
                                            {device.comments || "-"}
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-400 whitespace-nowrap">
                                            {formatDate(device.updated_at)}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                onClick={() => handleEditClick(device)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* MODALES */}
            <CreateDeviceDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                category={category}
                onSuccess={fetchData}
            />

            <AddColumnDialog
                open={isAddColumnOpen}
                onOpenChange={setIsAddColumnOpen}
                categoryId={categoryId as string}
                onSuccess={fetchData}
            />

            <EditDeviceDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                category={category}
                device={selectedDevice}
                onSuccess={fetchData}
            />
        </div>
    );
}
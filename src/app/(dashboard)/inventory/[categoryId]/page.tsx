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
import { ArrowLeft, Plus, HardDrive, Columns, Pencil, History, NotepadText } from "lucide-react";
import { CreateDeviceDialog } from "@/components/inventory/CreateDeviceDialog";
import { AddColumnDialog } from "@/components/inventory/AddColumnDialog";
import { EditDeviceDialog } from "@/components/inventory/EditDeviceDialog";
import { DataFilters } from "@/components/common/DataFilters";
import { DeviceHistoryDialog } from "@/components/inventory/DeviceHistoryDialog";
import { PrintReportDialog } from "@/components/reports/PrintReportDialog";

export default function CategoryDetailPage() {
    const { categoryId } = useParams();
    const router = useRouter();

    const [category, setCategory] = useState<any>(null);
    const [devices, setDevices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [historyDeviceId, setHistoryDeviceId] = useState<string | null>(null);

    // Estados Modales
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState<any>(null);

    // Estados Filtros
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [unitFilter, setUnitFilter] = useState("");
    const [units, setUnits] = useState<any[]>([]);
    const [dateFilter, setDateFilter] = useState(""); // Estado para la fecha

    const [isPrintOpen, setIsPrintOpen] = useState(false);
    const [printDevice, setPrintDevice] = useState<any>(null); // El dispositivo a imprimir

    const handlePrintClick = (device: any) => {
        setPrintDevice(device);
        setIsPrintOpen(true);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleString("es-SV", {
            day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
        });
    };

    // Carga de Datos Principal (Dispositivos)
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
            if (dateFilter) params.append('date', dateFilter); // Enviamos la fecha

            const devRes = await api.get(`/devices?${params.toString()}`);
            setDevices(devRes.data.data || devRes.data);

        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    }, [categoryId, searchText, statusFilter, unitFilter, dateFilter, category]);

    // Abrir Historial
    const handleHistoryClick = (deviceId: string) => {
        setHistoryDeviceId(deviceId);
        setIsHistoryOpen(true);
    };

    // Efecto Debounce para recargar datos
    useEffect(() => {
        const timer = setTimeout(() => {
            if (categoryId) fetchData();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchData, categoryId]);

    // Carga de Unidades para el Select
    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const res = await api.get("/units");
                const list = Array.isArray(res.data) ? res.data : (res.data.data || []);
                setUnits(list);
            } catch (error) {
                console.error("Error cargando unidades:", error);
                setUnits([]);
            }
        };
        fetchUnits();
    }, []);

    const clearFilters = () => {
        setSearchText("");
        setStatusFilter("all");
        setUnitFilter("");
        setDateFilter(""); // Limpiamos la fecha
    };

    const handleEditClick = (device: any) => {
        setSelectedDevice(device);
        setIsEditOpen(true);
    };

    if (loading && !category) return <div className="p-8 text-center">Cargando sistema...</div>;
    if (!category && !loading) return <div className="p-8 text-center text-red-500">Categoría no encontrada</div>;

    return (
        <div className="space-y-6">
            {/* HEADER */}
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

            <DataFilters
                searchValue={searchText}
                onSearchChange={setSearchText}
                searchColSpan="md:col-span-3 lg:col-span-3"
                clearColSpan="md:col-span-1"
                hasActiveFilters={!!(searchText || unitFilter || statusFilter !== 'all' || dateFilter)}
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
                                <SelectItem key={unit.id} value={unit.name}>
                                    {unit.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="col-span-1 md:col-span-2 lg:col-span-2 space-y-1">
                    <span className="text-xs font-medium text-slate-500 ml-1">Estado</span>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="bg-white w-full">
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="available">🟢 Disponible</SelectItem>
                            <SelectItem value="assigned">🔵 Asignado</SelectItem>
                            <SelectItem value="maintenance">🟠 Mantenimiento</SelectItem>
                            <SelectItem value="retired">🔴 Descargo</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="col-span-1 md:col-span-2 lg:col-span-2 space-y-1">
                    <span className="text-xs font-medium text-slate-500 ml-1">Fecha Registro</span>
                    <Input
                        type="date"
                        className="bg-white w-full"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    />
                </div>
            </DataFilters>

            {/* TABLA DE RESULTADOS */}
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
                                {category?.fields?.map((field: any) => (
                                    <TableHead key={field.key} className="font-bold text-slate-700">{field.label}</TableHead>
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
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-orange-600 hover:bg-orange-50"
                                                    onClick={() => handlePrintClick(device)}
                                                    title="Imprimir Acta"
                                                >
                                                    <NotepadText className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-purple-600 hover:bg-purple-50"
                                                    onClick={() => handleHistoryClick(device.id)}
                                                >
                                                    <History className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                    onClick={() => handleEditClick(device)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </div>
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

            <DeviceHistoryDialog
                open={isHistoryOpen}
                onOpenChange={setIsHistoryOpen}
                deviceId={historyDeviceId}
            />

            <PrintReportDialog
                open={isPrintOpen}
                onOpenChange={setIsPrintOpen}
                device={printDevice}
            />
        </div>
    );
}
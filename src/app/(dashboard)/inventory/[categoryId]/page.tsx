"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    ArrowLeft, Plus, HardDrive, Columns, Pencil, History, NotepadText,
    ChevronLeft, ChevronRight // --- CAMBIO: Importar iconos ---
} from "lucide-react";
import { CreateDeviceDialog } from "@/components/inventory/CreateDeviceDialog";
import { AddColumnDialog } from "@/components/inventory/AddColumnDialog";
import { EditDeviceDialog } from "@/components/inventory/EditDeviceDialog";
import { DataFilters } from "@/components/common/DataFilters";
import { DeviceHistoryDialog } from "@/components/inventory/DeviceHistoryDialog";
import { PrintReportDialog } from "@/components/reports/PrintReportDialog";
import { InventoryTableActions } from "@/components/inventory/InventoryTableActions";
import { canManageSystem } from "@/lib/permissions";
import { useAuth } from "@/hooks/useAuth";
import { ExportButton } from "@/components/common/ExportButton";

export default function CategoryDetailPage() {
    const { categoryId } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const isSuperAdmin = canManageSystem(user?.role?.name);
    const tableRef = useRef<HTMLDivElement>(null);

    const [category, setCategory] = useState<any>(null);
    const [devices, setDevices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // --- CAMBIO: ESTADO DE PAGINACIÓN ---
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        from: 0,
        to: 0
    });

    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [historyDeviceId, setHistoryDeviceId] = useState<string | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState<any>(null);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [unitFilter, setUnitFilter] = useState("");
    const [units, setUnits] = useState<any[]>([]);
    const [dateFilter, setDateFilter] = useState("");
    const [isPrintOpen, setIsPrintOpen] = useState(false);
    const [printDevice, setPrintDevice] = useState<any>(null);

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

    // --- CAMBIO: fetchData ACEPTA page ---
    const fetchData = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            if (!category) {
                const catRes = await api.get(`/categories/${categoryId}`);
                setCategory(catRes.data);
            }

            const params = new URLSearchParams();
            params.append('category_id', categoryId as string);
            params.append('page', page.toString()); // --- CAMBIO: Enviamos la página ---

            if (searchText) params.append('search', searchText);
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (unitFilter) params.append('unit', unitFilter);
            if (dateFilter) params.append('date', dateFilter);

            const devRes = await api.get(`/devices?${params.toString()}`);

            // --- CAMBIO: Manejo de respuesta paginada ---
            // Laravel con paginate devuelve: { data: [...], current_page: 1, ... }
            setDevices(devRes.data.data);

            setPagination({
                current_page: devRes.data.current_page,
                last_page: devRes.data.last_page,
                total: devRes.data.total,
                from: devRes.data.from,
                to: devRes.data.to
            });

        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    }, [categoryId, searchText, statusFilter, unitFilter, dateFilter, category]);

    // --- CAMBIO: Función para cambiar página ---
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            fetchData(newPage);
        }
    };

    // Efecto Debounce (Resetea a página 1 si cambian filtros)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (categoryId) fetchData(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchData, categoryId, searchText, statusFilter, unitFilter, dateFilter]); // Agregados filtros a dependencias

    // Carga de Unidades
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
        setDateFilter("");
    };

    const handleEditClick = (device: any) => {
        setSelectedDevice(device);
        setIsEditOpen(true);
    };

    if (loading && !category && !devices.length) return <div className="p-8 text-center">Cargando sistema...</div>;
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
                    <ExportButton
                        data={devices}
                        filename={`inventario_${category?.name || 'dispositivos'}`}
                        disabled={loading}
                        categoryFields={category?.fields || []}
                    />
                    <InventoryTableActions
                        data={devices}
                        categoryName={category?.name || "Inventario"}
                        categoryFields={category?.fields || []}
                    />

                    <TooltipProvider>
                        {isSuperAdmin && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => setIsAddColumnOpen(true)}
                                        className="border-blue-200 text-blue-600 hover:bg-blue-50 rounded-full h-10 w-10"
                                    >
                                        <Columns className="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Agregar Columna</p>
                                </TooltipContent>
                            </Tooltip>
                        )}

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    onClick={() => setIsCreateOpen(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg h-10 w-10"
                                >
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Registrar {category?.name || 'Dispositivo'}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
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
                {/* ... (TUS FILTROS SE MANTIENEN IGUAL) ... */}
                <div className="col-span-1 md:col-span-2 lg:col-span-2 space-y-1">
                    <span className="text-xs font-medium text-slate-500 ml-1">Unidad</span>
                    <Select value={unitFilter || "all"} onValueChange={(val) => setUnitFilter(val === "all" ? "" : val)}>
                        <SelectTrigger className="bg-white w-full"><SelectValue placeholder="Todas" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {Array.isArray(units) && units.map((unit) => (<SelectItem key={unit.id} value={unit.name}>{unit.name}</SelectItem>))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="col-span-1 md:col-span-2 lg:col-span-2 space-y-1">
                    <span className="text-xs font-medium text-slate-500 ml-1">Estado</span>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="bg-white w-full"><SelectValue placeholder="Todos" /></SelectTrigger>
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
                    <Input type="date" className="bg-white w-full" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
                </div>
            </DataFilters>

            {/* TABLA DE RESULTADOS */}
            <Card>
                <CardContent className="p-0 overflow-x-auto">
                    <div ref={tableRef} className="print-container">
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
                                    <TableHead className="font-bold text-slate-700 whitespace-nowrap">Acciones</TableHead>
                                    <TableHead className="w-[50px] print:hidden"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={12} className="h-24 text-center text-blue-600">Cargando resultados...</TableCell></TableRow>
                                ) : devices.length === 0 ? (
                                    <TableRow><TableCell colSpan={12} className="h-24 text-center text-slate-500">No se encontraron dispositivos.</TableCell></TableRow>
                                ) : (
                                    devices.map((device) => (
                                        <TableRow key={device.id} className="hover:bg-slate-50/80 transition-colors">
                                            {/* ... (TUS CELDAS DE TABLA SE MANTIENEN IGUAL) ... */}
                                            <TableCell className="font-medium text-slate-900">
                                                {device.employee ? (
                                                    <div className="flex items-center gap-2"><span className="whitespace-nowrap">{device.employee.name}</span></div>
                                                ) : (<span className="text-slate-400 text-xs italic">-- Sin Asignar --</span>)}
                                            </TableCell>
                                            <TableCell>{device.employee?.unit ? (<Badge variant="outline" className="text-slate-600 border-slate-300">{device.employee.unit.name}</Badge>) : (<span className="text-slate-300">-</span>)}</TableCell>
                                            <TableCell className="font-mono text-sm">{device.inventory_code}</TableCell>
                                            <TableCell>{device.brand}</TableCell>
                                            <TableCell>{device.model}</TableCell>
                                            <TableCell className="text-xs text-slate-500 font-mono uppercase">{device.serial_number}</TableCell>
                                            {category?.fields?.map((field: any) => (<TableCell key={field.key} className="text-slate-600">{device.specs?.[field.key] || "-"}</TableCell>))}
                                            <TableCell>
                                                <Badge className={device.status === 'available' ? 'bg-green-100 text-green-700' : device.status === 'assigned' ? 'bg-blue-100 text-blue-700' : device.status === 'maintenance' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}>
                                                    {device.status === 'available' ? 'Disponible' : device.status === 'assigned' ? 'Asignado' : device.status === 'maintenance' ? 'Mantenimiento' : 'Retirado'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-500 max-w-[200px] truncate" title={device.comments}>{device.comments || "-"}</TableCell>
                                            <TableCell className="text-xs text-slate-400 whitespace-nowrap">{formatDate(device.updated_at)}</TableCell>
                                            <TableCell className="text-right print:hidden">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-orange-600 hover:bg-orange-50" onClick={() => handlePrintClick(device)} title="Imprimir Acta"><NotepadText className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-purple-600 hover:bg-purple-50" onClick={() => { setHistoryDeviceId(device.id); setIsHistoryOpen(true); }}><History className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => handleEditClick(device)}><Pencil className="h-4 w-4" /></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* --- FOOTER DE PAGINACIÓN (Estilo Auditoría) --- */}
                    <div className="flex items-center justify-between sm:justify-end p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 gap-2">
                        <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400 mr-4">
                            Página <span className="font-medium text-slate-900 dark:text-slate-100">{pagination.current_page}</span> de <span className="font-medium text-slate-900 dark:text-slate-100">{pagination.last_page}</span>
                        </span>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.current_page - 1)} disabled={pagination.current_page === 1 || loading} className="h-8 w-8 p-0">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="sm:hidden text-xs font-medium text-slate-700 dark:text-slate-300 min-w-[50px] text-center">
                                {pagination.current_page} / {pagination.last_page}
                            </span>
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.current_page + 1)} disabled={pagination.current_page === pagination.last_page || loading} className="h-8 w-8 p-0">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                </CardContent>
            </Card>

            {/* MODALES (MANTENER IGUAL) */}
            <CreateDeviceDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} category={category} onSuccess={() => fetchData(1)} />
            <AddColumnDialog open={isAddColumnOpen} onOpenChange={setIsAddColumnOpen} categoryId={categoryId as string} onSuccess={() => fetchData(1)} />
            <EditDeviceDialog open={isEditOpen} onOpenChange={setIsEditOpen} category={category} device={selectedDevice} onSuccess={() => fetchData(pagination.current_page)} />
            <DeviceHistoryDialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen} deviceId={historyDeviceId} />
            <PrintReportDialog open={isPrintOpen} onOpenChange={setIsPrintOpen} device={printDevice} />
        </div>
    );
}
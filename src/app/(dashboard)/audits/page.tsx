"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    FileText, User, ArrowRight, Plus, AlertCircle, ChevronLeft, ChevronRight
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataFilters } from "@/components/common/DataFilters";

export default function AuditsPage() {

    // Traducciones de campos
    const FIELD_TRANSLATIONS: Record<string, string> = {
        is_active: "Estado", comments: "Comentario", name: "Nombre", email: "Correo",
        role_id: "Rol", employee_id: "Empleado", device_id: "Equipo",
        unit_id: "Unidad", inventory_code: "N° Inventario", brand: "Marca",
        model: "Modelo", serial_number: "Serie", status: "Estado", provider: "Proveedor",
        invoice_number: "Factura", total_amount: "Monto", note: "Nota", job_title: "Cargo",
    };

    // Campos permitidos por módulo
    const MODULE_CONFIG: Record<string, string[]> = {
        'Dispositivo': ['inventory_code', 'status', 'brand', 'model', 'comments'],
        'Usuario': ['name', 'email', 'is_active'],
        'Empleado': ['name', 'status', 'job_title'],
        'Compra': ['provider', 'invoice_number', 'total_amount'],
        'Unidad': ['name'], 'Rol': ['name'], 'Categoría': ['name'],
        'Asignación': ['note', 'status'],
        'default': ['name', 'inventory_code']
    };



    const getFieldLabel = (key: string) => FIELD_TRANSLATIONS[key] || key.replace(/_/g, " ");

    // Formatear valores de auditoría - más limpio
    const formatAuditValue = (key: string, value: any) => {
        if (value === null || value === "" || value === undefined || value === "null") return null;

        // Ocultar IDs técnicos (UUIDs largos) pero NO los nombres resueltos
        const isTechnicalID = typeof value === 'string' && value.length > 30 && /^[a-f0-9-]+$/i.test(value);
        if (isTechnicalID) return null;

        const isRelationField = ['employee_id', 'device_id', 'role_id', 'unit_id'].includes(key);

        // Para relaciones, mostrar el nombre resuelto con un badge
        if (isRelationField && typeof value === 'string') {
            return <Badge variant="outline" className="text-slate-600 border-slate-300 text-xs font-normal">{value}</Badge>;
        }

        // Estados activo/inactivo
        if (key === 'is_active' || typeof value === 'boolean') {
            return value ? (
                <Badge className="bg-green-100 text-green-700 border-green-200 shadow-none text-[10px] font-semibold">ACTIVO</Badge>
            ) : (
                <Badge className="bg-red-100 text-red-700 border-red-200 shadow-none text-[10px] font-semibold">INACTIVO</Badge>
            );
        }

        // Texto largo con tooltip
        if (typeof value === 'string' && value.length > 25) {
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="cursor-help text-slate-700 max-w-[150px] truncate block text-xs">
                                {value.substring(0, 25)}...
                            </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px] bg-slate-900 text-white text-xs p-2">
                            <p>{value}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }

        return <span className="text-slate-700 text-xs">{String(value)}</span>;
    };

    // Formato de fecha
    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleString("es-ES", {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getEventBadge = (event: string) => {
        if (event === 'created') return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none px-2.5 py-0.5 text-[10px] font-medium">Creación</Badge>;
        if (event === 'updated') return <Badge className="bg-blue-50 text-blue-700 border-blue-200 shadow-none px-2.5 py-0.5 text-[10px] font-medium">Edición</Badge>;
        return <Badge className="bg-red-50 text-red-700 border-red-200 shadow-none px-2.5 py-0.5 text-[10px] font-medium">Eliminación</Badge>;
    };

    const formatModel = (model: string) => {
        const cleanName = model.split('\\').pop() || model;
        const translations: Record<string, string> = {
            'Device': 'Dispositivo', 'Assignment': 'Asignación', 'User': 'Usuario',
            'Role': 'Rol', 'Employee': 'Empleado', 'Unit': 'Unidad',
            'Category': 'Categoría', 'Purchase': 'Compra'
        };
        return translations[cleanName] || cleanName;
    };



    // Renderizar detalles del cambio - versión mejorada
    const renderDetails = (log: any) => {
        const oldVal = log.old_values || {};
        const newVal = log.new_values || {};
        const modelName = formatModel(log.auditable_type);
        const allowedFields = MODULE_CONFIG[modelName] || MODULE_CONFIG['default'];

        // Para asignaciones - mostrar mensaje simple
        if (modelName === 'Asignación') {
            if (log.event === 'created') {
                return <span className="text-xs text-emerald-600 font-medium">Nueva asignación realizada</span>;
            }
            return <span className="text-xs text-slate-500">Asignación actualizada</span>;
        }

        if (log.event === 'created') {
            const items: any[] = [];
            Object.keys(newVal).forEach(key => {
                if (!allowedFields.includes(key)) return;
                const formattedVal = formatAuditValue(key, newVal[key]);
                if (!formattedVal) return;
                items.push(
                    <div key={key} className="inline-flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 mr-1.5 mb-1">
                        <span className="font-semibold text-slate-500 text-[10px] uppercase tracking-wide">{getFieldLabel(key)}</span>
                        {formattedVal}
                    </div>
                );
            });

            return items.length > 0 ? (
                <div className="flex flex-wrap items-center gap-1">
                    <Plus className="w-3 h-3 text-emerald-500 mr-1" />
                    {items}
                </div>
            ) : (
                <span className="text-xs text-slate-400 italic">Registro creado</span>
            );
        }

        // Para actualizaciones - mostrar cambios
        const changes: any[] = [];
        Object.keys(newVal).forEach(key => {
            if (['updated_at', 'created_at', 'id'].includes(key)) return;

            // Filtrar campos técnicos no relevantes
            const isRelationField = ['employee_id', 'device_id', 'role_id', 'unit_id'].includes(key);
            if (key.endsWith('_id') && !isRelationField) return;

            if (JSON.stringify(oldVal[key]) !== JSON.stringify(newVal[key])) {
                const valOld = formatAuditValue(key, oldVal[key]);
                const valNew = formatAuditValue(key, newVal[key]);
                if (!valNew && !valOld) return;

                changes.push(
                    <div key={key} className="flex items-center gap-2 py-1">
                        <span className="font-semibold text-slate-600 text-xs min-w-[70px]">{getFieldLabel(key)}:</span>
                        <div className="flex items-center gap-2 bg-white border border-slate-100 px-2 py-1 rounded-md">
                            <span className="text-slate-400 line-through text-xs">{valOld || <em className="text-[10px] not-italic">vacío</em>}</span>
                            <ArrowRight className="w-3 h-3 text-slate-300" />
                            {valNew || <em className="text-slate-400 text-[10px] not-italic">vacío</em>}
                        </div>
                    </div>
                );
            }
        });

        return changes.length > 0 ? (
            <div className="flex flex-col">{changes}</div>
        ) : (
            <span className="text-xs text-slate-400 italic">Actualización de sistema</span>
        );
    };

    // --- ESTADOS ---
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [dateFilter, setDateFilter] = useState("");

    const [pagination, setPagination] = useState({
        current_page: 1, last_page: 1, total: 0, from: 0, to: 0
    });

    // Función de carga con filtros
    const fetchLogs = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            if (searchText) params.append('search', searchText);
            if (dateFilter) params.append('date', dateFilter);

            const res = await api.get(`/audits?${params.toString()}`);
            const allLogs = res.data.data || [];

            // Filtrar asignaciones del cliente por ahora
            const cleanLogs = allLogs.filter((log: any) =>
                !log.auditable_type.includes('Assignment')
            );

            setLogs(cleanLogs);
            setPagination({
                current_page: res.data.current_page || 1,
                last_page: res.data.last_page || 1,
                total: res.data.total || 0,
                from: res.data.from || 0,
                to: res.data.to || 0
            });
        } catch (error) {
            console.error("Error cargando auditoría", error);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, [searchText, dateFilter]);

    // Efecto con debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLogs(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchLogs]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            fetchLogs(newPage);
        }
    };

    const clearFilters = () => {
        setSearchText("");
        setDateFilter("");
    };

    const hasActiveFilters = !!(searchText || dateFilter);

    return (
        <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
            {/* HEADER */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="h-6 w-6 text-blue-600" />
                    Auditoría de Datos
                </h1>
                <p className="text-slate-500 text-sm mt-1">Historial de cambios y movimientos del sistema</p>
            </div>

            {/* FILTROS */}
            <DataFilters
                searchValue={searchText}
                onSearchChange={setSearchText}
                searchPlaceholder="Buscar por responsable..."
                searchColSpan="md:col-span-6"
                hasActiveFilters={hasActiveFilters}
                onClear={clearFilters}
                clearColSpan="md:col-span-2"
            >
                <div className="col-span-1 md:col-span-3 space-y-1">
                    <span className="text-xs font-medium text-slate-500 ml-1">Fecha</span>
                    <Input
                        type="date"
                        className="bg-white w-full"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    />
                </div>
            </DataFilters>

            {/* TABLA */}
            <Card className="shadow-sm border-slate-200 bg-white overflow-hidden">
                <CardHeader className="pb-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> Movimientos del Sistema
                        </CardTitle>
                        <span className="text-xs text-slate-400">
                            {pagination.from || 0} - {pagination.to || 0} de {pagination.total} registros
                        </span>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent bg-slate-50/50">
                                <TableHead className="font-semibold text-slate-700 text-xs w-[160px]">RESPONSABLE</TableHead>
                                <TableHead className="font-semibold text-slate-700 text-xs w-[90px]">ACCIÓN</TableHead>
                                <TableHead className="font-semibold text-slate-700 text-xs w-[130px]">MÓDULO</TableHead>
                                <TableHead className="font-semibold text-slate-700 text-xs">DETALLES</TableHead>
                                <TableHead className="text-right font-semibold text-slate-700 text-xs w-[100px]">FECHA</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} className="h-24 text-center text-slate-500 text-xs">Cargando historial...</TableCell></TableRow>
                            ) : logs.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="h-24 text-center text-slate-500 text-xs">Sin registros.</TableCell></TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id} className="hover:bg-blue-50/30 group border-b border-slate-50">
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-600 flex items-center justify-center border border-indigo-200/50">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <span className="font-medium text-slate-800 text-sm">
                                                    {log.user ? log.user.name : "Sistema"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">{getEventBadge(log.event)}</TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs font-medium text-slate-600">{formatModel(log.auditable_type)}</span>
                                                {log.auditable_name && (
                                                    <span className="text-[11px] text-slate-400">{log.auditable_name}</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">{renderDetails(log)}</TableCell>
                                        <TableCell className="text-right py-4 text-slate-500 text-xs whitespace-nowrap">
                                            {formatDate(log.created_at)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>

                {/* PAGINACIÓN */}
                <div className="flex items-center justify-end p-4 border-t border-slate-100 bg-slate-50/30 gap-2">
                    <span className="text-xs text-slate-500 mr-4">
                        Página <span className="font-medium text-slate-900">{pagination.current_page}</span> de <span className="font-medium text-slate-900">{pagination.last_page}</span>
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.current_page - 1)}
                        disabled={pagination.current_page === 1 || loading}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
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
            </Card>
        </div>
    );
}
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Necesitamos botones
import {
    FileText, User, ArrowRight, LayoutGrid,
    Plus, AlertCircle, Link as LinkIcon,
    ChevronLeft, ChevronRight // Iconos para paginación
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AuditsPage() {

    // ... (MANTÉN TU DICCIONARIO FIELD_TRANSLATIONS IGUAL) ...
    const FIELD_TRANSLATIONS: Record<string, string> = {
        is_active: "Estado", comments: "Comentario", name: "Nombre", email: "Correo",
        role_id: "Rol (Ref)", employee_id: "Empleado (Ref)", device_id: "Equipo (Ref)",
        unit_id: "Unidad (Ref)", inventory_code: "N° Inventario", brand: "Marca",
        model: "Modelo", serial_number: "Serie", status: "Estado", provider: "Proveedor",
        invoice_number: "Factura", total_amount: "Monto", note: "Nota",
    };

    // ... (MANTÉN TU MODULE_CONFIG IGUAL) ...
    const MODULE_CONFIG: Record<string, string[]> = {
        'Dispositivo': ['inventory_code', 'status'],
        'Usuario': ['name', 'email', 'is_active', 'role_id'],
        'Empleado': ['name', 'status', 'job_title', 'unit_id'],
        'Compra': ['provider', 'invoice_number', 'total_amount'],
        'Unidad': ['name'], 'Rol': ['name'], 'Categoría': ['name'],
        'Asignación': ['employee_id', 'device_id', 'note', 'status'],
        'default': ['name', 'inventory_code']
    };

    // ... (MANTÉN TUS FUNCIONES AUXILIARES: getFieldLabel, isTechnicalID, formatAuditValue, formatDate, getEventBadge, formatModel, renderDetails IGUALES) ...
    const getFieldLabel = (key: string) => FIELD_TRANSLATIONS[key] || key.replace(/_/g, " ");
    const isTechnicalID = (value: any) => typeof value === 'string' && value.length > 15 && /\d/.test(value) && /[a-zA-Z]/.test(value);

    // [Aquí iría tu función formatAuditValue completa...]
    const formatAuditValue = (key: string, value: any) => {
        if (value === null || value === "" || value === undefined || value === "null") return null;
        const isRelationField = ['employee_id', 'device_id', 'role_id', 'unit_id'].includes(key);
        if (isTechnicalID(value) && !isRelationField && !key.includes('comment')) return null;
        if (isRelationField && typeof value === 'string' && value.length > 10) {
            return <Badge variant="outline" className="font-mono text-[10px] text-slate-500 bg-slate-50 border-slate-200 h-5 px-1.5 gap-1"><LinkIcon className="w-2 h-2" />{value.substring(0, 7)}...</Badge>;
        }
        if (key === 'is_active' || typeof value === 'boolean') {
            return value ? <span className="text-green-600 font-bold text-[10px]">ACTIVO</span> : <span className="text-red-600 font-bold text-[10px]">INACTIVO</span>;
        }
        if (typeof value === 'string' && value.length > 30) {
            return <TooltipProvider><Tooltip><TooltipTrigger asChild><span className="cursor-help border-b border-dotted border-slate-400 max-w-[200px] truncate block text-slate-700">{value}</span></TooltipTrigger><TooltipContent className="max-w-[300px] bg-slate-900 text-white text-xs p-2"><p>{value}</p></TooltipContent></Tooltip></TooltipProvider>;
        }
        return <span className="text-slate-700 font-medium text-xs">{String(value)}</span>;
    };

    const formatDate = (dateString: string) => !dateString ? "-" : new Date(dateString).toLocaleString("es-ES", { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
    const getEventBadge = (event: string) => { /* ... tu código ... */
        if (event === 'created') return <Badge className="bg-green-50 text-green-700 border-green-200 shadow-none px-2 py-0.5 text-[10px]">Creación</Badge>;
        if (event === 'updated') return <Badge className="bg-blue-50 text-blue-700 border-blue-200 shadow-none px-2 py-0.5 text-[10px]">Edición</Badge>;
        return <Badge className="bg-red-50 text-red-700 border-red-200 shadow-none px-2 py-0.5 text-[10px]">Eliminación</Badge>;
    };
    const formatModel = (model: string) => { /* ... tu código ... */
        const cleanName = model.split('\\').pop() || model;
        const translations: Record<string, string> = { 'Device': 'Dispositivo', 'Assignment': 'Asignación', 'User': 'Usuario', 'Role': 'Rol', 'Employee': 'Empleado', 'Unit': 'Unidad', 'Category': 'Categoría', 'Purchase': 'Compra' };
        return translations[cleanName] || cleanName;
    };

    // [Aquí iría tu función renderDetails completa...]
    const renderDetails = (log: any) => {
        // ... (Pega aquí el mismo renderDetails que ya tienes limpio y optimizado) ...
        const oldVal = log.old_values || {};
        const newVal = log.new_values || {};
        const modelName = formatModel(log.auditable_type);
        const allowedFields = MODULE_CONFIG[modelName] || MODULE_CONFIG['default'];
        const changes: any[] = [];

        if (modelName === 'Asignación' && log.event === 'created') return newVal['note'] ? <div key="note" className="text-xs text-slate-600"><span className="font-bold">Nota:</span> {newVal['note']}</div> : <span className="text-xs text-slate-500 italic">Asignación realizada (Ver detalle en ficha)</span>;

        if (log.event === 'created') {
            Object.keys(newVal).forEach(key => {
                if (!allowedFields.includes(key)) return;
                const formattedVal = formatAuditValue(key, newVal[key]);
                if (!formattedVal) return;
                changes.push(<div key={key} className="inline-flex items-center gap-1.5 mr-2 mb-1 bg-slate-50 px-2 py-1 rounded border border-slate-100"><span className="font-bold text-slate-500 text-[9px] uppercase">{getFieldLabel(key)}</span><span className="text-slate-300">|</span>{formattedVal}</div>);
            });
            return changes.length > 0 ? <div className="flex flex-wrap items-center"><Plus className="w-3 h-3 text-green-500 mr-1.5" />{changes}</div> : <span className="text-xs text-slate-400 italic">Registro creado</span>;
        }

        Object.keys(newVal).forEach(key => {
            if (['updated_at', 'created_at', 'id'].includes(key)) return;
            const isRelationField = ['employee_id', 'device_id', 'role_id', 'unit_id'].includes(key);
            if (key.endsWith('_id') && !isRelationField) return;
            if (JSON.stringify(oldVal[key]) !== JSON.stringify(newVal[key])) {
                const valOld = formatAuditValue(key, oldVal[key]);
                const valNew = formatAuditValue(key, newVal[key]);
                if (!valNew && !valOld) return;
                changes.push(<div key={key} className="flex items-center gap-2 text-xs mb-1 last:mb-0"><span className="font-bold text-slate-600 w-[80px] shrink-0 truncate text-right">{getFieldLabel(key)}:</span><div className="flex items-center gap-1.5 min-w-0 bg-white border border-slate-100 px-2 py-0.5 rounded shadow-sm"><span className="text-slate-400 line-through max-w-[100px] truncate">{valOld || <span className="italic text-[10px]">vacío</span>}</span><ArrowRight className="w-3 h-3 text-slate-300 mx-1" /><span className="text-slate-800 font-medium max-w-[120px] truncate">{valNew || <span className="italic text-[10px]">vacío</span>}</span></div></div>);
            }
        });
        return changes.length > 0 ? <div className="flex flex-col gap-1">{changes}</div> : <span className="text-xs text-slate-400">Actualización interna</span>;
    };

    // --- ESTADOS ---
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // --- NUEVO ESTADO PARA PAGINACIÓN ---
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        from: 0,
        to: 0
    });

    // --- EFECTO INICIAL ---
    useEffect(() => {
        fetchLogs(1); // Cargamos la página 1 al inicio
    }, []);

    // --- FUNCIÓN DE CARGA MODIFICADA PARA ACEPTAR 'page' ---
    const fetchLogs = async (page = 1) => {
        setLoading(true);
        try {
            // Enviamos el parámetro ?page=X al backend
            const res = await api.get(`/audits?page=${page}`);

            // FILTRO DE ASIGNACIONES (Se mantiene)
            // Nota: Al paginar, res.data ahora contiene metadatos, y los logs están en res.data.data
            const allLogs = res.data.data;

            const cleanLogs = allLogs.filter((log: any) =>
                !log.auditable_type.includes('Assignment')
            );

            setLogs(cleanLogs);

            // GUARDAMOS LA DATA DE PAGINACIÓN
            setPagination({
                current_page: res.data.current_page,
                last_page: res.data.last_page,
                total: res.data.total,
                from: res.data.from,
                to: res.data.to
            });

        } catch (error) {
            console.error("Error cargando auditoría", error);
        } finally {
            setLoading(false);
        }
    };

    // --- MANEJO DE CAMBIO DE PÁGINA ---
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            fetchLogs(newPage);
        }
    };

    return (
        <div className="space-y-6 p-6 max-w-[1600px] mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="h-6 w-6 text-blue-600" />
                    Auditoría de Datos
                </h1>
            </div>

            <Card className="shadow-sm border-slate-200 bg-white">
                <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/30">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> Movimientos del Sistema
                        </CardTitle>

                        {/* Indicador de Resultados (Ej: Mostrando 1-15 de 50) */}
                        <span className="text-xs text-slate-400">
                            Mostrando {pagination.from || 0} - {pagination.to || 0} de {pagination.total} registros
                        </span>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent bg-slate-50/50">
                                <TableHead className="font-semibold text-slate-700 text-xs w-[180px]">RESPONSABLE</TableHead>
                                <TableHead className="font-semibold text-slate-700 text-xs w-[100px]">ACCIÓN</TableHead>
                                <TableHead className="font-semibold text-slate-700 text-xs w-[120px]">MÓDULO</TableHead>
                                <TableHead className="font-semibold text-slate-700 text-xs">DETALLES DEL CAMBIO</TableHead>
                                <TableHead className="text-right font-semibold text-slate-700 text-xs w-[140px]">FECHA</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} className="h-24 text-center text-slate-500 text-xs">Cargando historial...</TableCell></TableRow>
                            ) : logs.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="h-24 text-center text-slate-500 text-xs">Sin registros.</TableCell></TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id} className="hover:bg-slate-50/60 group">
                                        {/* ... (TUS CELDAS DE TABLA SE MANTIENEN IGUAL) ... */}
                                        <TableCell className="align-top py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                                                    <User className="w-3 h-3" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-800 text-xs">
                                                        {log.user ? log.user.name : "Sistema"}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-top py-3">{getEventBadge(log.event)}</TableCell>
                                        <TableCell className="align-top py-3">
                                            <div className="flex items-center gap-1.5 text-slate-600">
                                                <LayoutGrid className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-xs font-medium">{formatModel(log.auditable_type)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-top py-3">{renderDetails(log)}</TableCell>
                                        <TableCell className="text-right text-slate-400 text-[11px] align-top py-3 font-mono">{formatDate(log.created_at)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>

                {/* --- FOOTER CON PAGINACIÓN --- */}
                <div className="flex items-center justify-end p-4 border-t border-slate-100 bg-slate-50/30 gap-2">
                    <div className="flex items-center gap-1 mr-4">
                        <span className="text-xs text-slate-500">
                            Página <span className="font-medium text-slate-900">{pagination.current_page}</span> de <span className="font-medium text-slate-900">{pagination.last_page}</span>
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
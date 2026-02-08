"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    FileText, User, ArrowRight, LayoutGrid,
    Plus, AlertCircle, Link as LinkIcon
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AuditsPage() {

    // --- 1. ESTADOS PARA LOS DICCIONARIOS DE NOMBRES ---
    // Aquí guardaremos la traducción de ID -> Nombre
    const [maps, setMaps] = useState({
        employees: {} as Record<string, string>,
        roles: {} as Record<string, string>,
        units: {} as Record<string, string>,
        devices: {} as Record<string, string>, // Opcional si no son demasiados
    });

    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // --- 2. CARGAR CATÁLOGOS AL INICIO ---
    useEffect(() => {
        const fetchCatalogs = async () => {
            try {
                // Hacemos peticiones en paralelo para obtener los nombres
                const [empRes, roleRes, unitRes, devRes] = await Promise.allSettled([
                    api.get("/employees"), // Asegúrate que esta ruta devuelva todos los empleados
                    api.get("/roles"),
                    api.get("/units"),
                    api.get("/devices") // Cuidado: Si son miles, esto podría ser pesado
                ]);

                const newMaps = {
                    employees: {} as Record<string, string>,
                    roles: {} as Record<string, string>,
                    units: {} as Record<string, string>,
                    devices: {} as Record<string, string>,
                };

                // Helper para llenar el mapa
                const fillMap = (res: any, map: Record<string, string>, labelField: string = 'name') => {
                    if (res.status === 'fulfilled' && res.value.data) {
                        // Soporta si la respuesta viene en data.data (paginado) o data (lista directa)
                        const list = Array.isArray(res.value.data) ? res.value.data : (res.value.data.data || []);
                        list.forEach((item: any) => {
                            map[item.id] = item[labelField] || item.inventory_code || item.name;
                        });
                    }
                };

                fillMap(empRes, newMaps.employees, 'name');
                fillMap(roleRes, newMaps.roles, 'name');
                fillMap(unitRes, newMaps.units, 'name');
                // Para dispositivos preferimos mostrar el código de inventario como "Nombre"
                fillMap(devRes, newMaps.devices, 'inventory_code');

                setMaps(newMaps);
            } catch (error) {
                console.error("Error cargando catálogos para traducción", error);
            }
        };

        fetchCatalogs();
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await api.get("/audits");

            // FILTRO: Ocultamos todo lo que venga del modelo 'Assignment' o 'Asignación'
            // porque esa info ya se ve reflejada en el cambio del Dispositivo.
            const cleanLogs = res.data.filter((log: any) =>
                !log.auditable_type.includes('Assignment')
            );

            setLogs(cleanLogs);
        } catch (error) {
            console.error("Error cargando auditoría", error);
        } finally {
            setLoading(false);
        }
    };

    // --- CONFIGURACIÓN Y DICCIONARIOS ---
    const FIELD_TRANSLATIONS: Record<string, string> = {
        is_active: "Estado",
        comments: "Comentario",
        name: "Nombre",
        email: "Correo",
        role_id: "Rol",
        employee_id: "Empleado",
        device_id: "Equipo",
        unit_id: "Unidad",
        inventory_code: "N° Inventario",
        brand: "Marca",
        model: "Modelo",
        serial_number: "Serie",
        status: "Estado",
        provider: "Proveedor",
        invoice_number: "Factura",
        total_amount: "Monto",
        note: "Nota",
    };

    const MODULE_CONFIG: Record<string, string[]> = {
        'Dispositivo': ['inventory_code', 'status', 'employee_id'],
        'Usuario': ['name', 'email', 'is_active', 'role_id'],
        'Empleado': ['name', 'status', 'job_title', 'unit_id'],
        'Compra': ['provider', 'invoice_number', 'total_amount'],
        'Unidad': ['name'],
        'Rol': ['name'],
        'Categoría': ['name'],
        'default': ['name', 'inventory_code']
    };

    const getFieldLabel = (key: string) => {
        return FIELD_TRANSLATIONS[key] || key.replace(/_/g, " ");
    };

    // --- FORMATEO DE VALORES CON TRADUCCIÓN ---
    const formatAuditValue = (key: string, value: any) => {
        if (value === null || value === "" || value === undefined || value === "null") return null;

        // 1. TRADUCCIÓN DE IDS (Aquí ocurre la magia)
        if (key === 'employee_id' && maps.employees[value]) {
            return <span className="font-medium text-slate-900">{maps.employees[value]}</span>;
        }
        if (key === 'role_id' && maps.roles[value]) {
            return <span className="font-medium text-slate-900">{maps.roles[value]}</span>;
        }
        if (key === 'unit_id' && maps.units[value]) {
            return <span className="font-medium text-slate-900">{maps.units[value]}</span>;
        }
        if (key === 'device_id' && maps.devices[value]) {
            return <span className="font-mono text-xs text-slate-700">{maps.devices[value]}</span>;
        }

        // 2. FILTRO DE IDs TÉCNICOS NO TRADUCIDOS
        // Si llegamos aquí es porque no encontramos el nombre en el mapa.
        // Si es un ID largo y no pudimos traducirlo, lo mostramos cortito como fallback.
        const isRelationField = ['employee_id', 'device_id', 'role_id', 'unit_id'].includes(key);
        const isLongId = typeof value === 'string' && value.length > 15 && /\d/.test(value);

        if (isLongId && !key.includes('comment')) {
            if (isRelationField) {
                // Fallback visual si no cargó el nombre
                return (
                    <Badge variant="outline" className="font-mono text-[9px] text-slate-400 border-slate-200 h-5 px-1">
                        <LinkIcon className="w-2 h-2 mr-1" />
                        {value.substring(0, 5)}...
                    </Badge>
                );
            }
            return null; // Ocultar otros IDs técnicos
        }

        // 3. BOOLEANOS
        if (key === 'is_active' || typeof value === 'boolean') {
            return value ?
                <span className="text-green-600 font-bold text-[10px]">ACTIVO</span> :
                <span className="text-red-600 font-bold text-[10px]">INACTIVO</span>;
        }

        // 4. COMENTARIOS
        if (typeof value === 'string' && value.length > 30) {
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="cursor-help border-b border-dotted border-slate-400 max-w-[200px] truncate block text-slate-700">
                                {value}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px] bg-slate-900 text-white text-xs p-2">
                            <p>{value}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }

        return <span className="text-slate-700 font-medium text-xs">{String(value)}</span>;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleString("es-ES", {
            day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
        });
    };

    const getEventBadge = (event: string) => {
        switch (event) {
            case 'created': return <Badge className="bg-green-50 text-green-700 border-green-200 shadow-none hover:bg-green-100 px-2 py-0.5 text-[10px]">Creación</Badge>;
            case 'updated': return <Badge className="bg-blue-50 text-blue-700 border-blue-200 shadow-none hover:bg-blue-100 px-2 py-0.5 text-[10px]">Edición</Badge>;
            case 'deleted': return <Badge className="bg-red-50 text-red-700 border-red-200 shadow-none hover:bg-red-100 px-2 py-0.5 text-[10px]">Eliminación</Badge>;
            default: return <Badge variant="secondary">{event}</Badge>;
        }
    };

    const formatModel = (model: string) => {
        if (!model) return "-";
        const cleanName = model.split('\\').pop() || model;
        const translations: Record<string, string> = {
            'Device': 'Dispositivo', 'Assignment': 'Asignación', 'User': 'Usuario',
            'Role': 'Rol', 'Employee': 'Empleado', 'Unit': 'Unidad',
            'Category': 'Categoría', 'Purchase': 'Compra'
        };
        return translations[cleanName] || cleanName;
    };

    const renderDetails = (log: any) => {
        const oldVal = log.old_values || {};
        const newVal = log.new_values || {};
        const modelName = formatModel(log.auditable_type);
        const allowedFields = MODULE_CONFIG[modelName] || MODULE_CONFIG['default'];
        const changes: any[] = [];

        // CASO CREACIÓN
        if (log.event === 'created') {
            Object.keys(newVal).forEach(key => {
                if (!allowedFields.includes(key)) return;

                const formattedVal = formatAuditValue(key, newVal[key]);
                if (formattedVal === null) return;

                changes.push(
                    <div key={key} className="inline-flex items-center gap-1.5 mr-2 mb-1 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        <span className="font-bold text-slate-500 text-[9px] uppercase">{getFieldLabel(key)}</span>
                        <span className="text-slate-300">|</span>
                        {formattedVal}
                    </div>
                );
            });

            return changes.length > 0 ? (
                <div className="flex flex-wrap items-center">
                    <Plus className="w-3 h-3 text-green-500 mr-1.5" />
                    {changes}
                </div>
            ) : <span className="text-xs text-slate-400 italic">Registro creado</span>;
        }

        // CASO EDICIÓN
        Object.keys(newVal).forEach(key => {
            if (['updated_at', 'created_at', 'id'].includes(key)) return;

            const isRelationField = ['employee_id', 'device_id', 'role_id', 'unit_id'].includes(key);
            if (key.endsWith('_id') && !isRelationField) return;

            if (JSON.stringify(oldVal[key]) !== JSON.stringify(newVal[key])) {
                const valOld = formatAuditValue(key, oldVal[key]);
                const valNew = formatAuditValue(key, newVal[key]);

                if (!valNew && !valOld) return;

                changes.push(
                    <div key={key} className="flex items-center gap-2 text-xs mb-1 last:mb-0">
                        <span className="font-bold text-slate-600 w-[80px] shrink-0 truncate text-right" title={getFieldLabel(key)}>
                            {getFieldLabel(key)}:
                        </span>

                        <div className="flex items-center gap-1.5 min-w-0 bg-white border border-slate-100 px-2 py-0.5 rounded shadow-sm">
                            <span className="text-slate-400 line-through max-w-[100px] truncate flex items-center">
                                {valOld || <span className="italic text-[10px]">vacío</span>}
                            </span>
                            <ArrowRight className="w-3 h-3 text-slate-300 mx-1" />
                            <span className="text-slate-800 font-medium max-w-[120px] truncate flex items-center">
                                {valNew || <span className="italic text-[10px]">vacío</span>}
                            </span>
                        </div>
                    </div>
                );
            }
        });

        return changes.length > 0 ? <div className="flex flex-col gap-1">{changes}</div> : <span className="text-xs text-slate-400">Actualización interna</span>;
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
                    <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Movimientos Recientes
                    </CardTitle>
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
                                <TableRow><TableCell colSpan={5} className="h-24 text-center text-slate-500 text-xs">Sin registros recientes.</TableCell></TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id} className="hover:bg-slate-50/60 group">
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
                                        {/* alinear hacia la izquierda y con un poco de padding vertical para que no quede tan pegado al borde inferior */}
                                        <TableCell className="align-top py-3 text-slate-700 text-xs">
                                            {renderDetails(log)}
                                        </TableCell>

                                        <TableCell className="text-right text-slate-400 text-[11px] align-top py-3 font-mono">
                                            {formatDate(log.created_at)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
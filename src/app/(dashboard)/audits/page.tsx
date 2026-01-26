"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, User, ArrowRight, LayoutGrid } from "lucide-react";

export default function AuditsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await api.get("/audits");
            setLogs(res.data);
        } catch (error) {
            console.error("Error cargando auditoría", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleString("es-ES", {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getEventBadge = (event: string) => {
        switch (event) {
            case 'created':
                return <Badge className="bg-green-600 hover:bg-green-700">Creación</Badge>;
            case 'updated':
                return <Badge className="bg-blue-600 hover:bg-blue-700">Edición</Badge>;
            case 'deleted':
                return <Badge className="bg-red-600 hover:bg-red-700">Eliminación</Badge>;
            default:
                return <Badge variant="secondary">{event}</Badge>;
        }
    };

    const formatModel = (model: string) => {
        if (!model) return "-";
        return model.replace('App\\Models\\', '');
    };

    const renderDetails = (log: any) => {
        if (log.event === 'created') {
            return <span className="text-xs text-slate-500 italic">Nuevo registro creado</span>;
        }
        if (log.event === 'deleted') {
            return <span className="text-xs text-red-500 italic">Registro eliminado</span>;
        }

        const oldVal = log.old_values || {};
        const newVal = log.new_values || {};
        const changes: any[] = [];

        Object.keys(newVal).forEach(key => {
            if (['updated_at', 'created_at', 'id'].includes(key)) return;

            if (oldVal[key] !== newVal[key]) {
                changes.push(
                    <div key={key} className="flex items-center gap-2 text-xs mb-1">
                        <span className="font-bold text-slate-700 capitalize w-[90px]">{key}:</span>
                        <span className="text-red-400 line-through truncate max-w-[80px]">{String(oldVal[key] || "vacío")}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="text-green-600 font-medium truncate max-w-[80px]">{String(newVal[key])}</span>
                    </div>
                );
            }
        });

        return changes.length > 0 ? <div>{changes}</div> : <span className="text-xs text-slate-400">Cambio interno</span>;
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="h-6 w-6 text-blue-600" />
                    Auditoría de Datos
                </h1>
            </div>

            <Card>
                <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                        Historial Reciente
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="font-bold text-slate-700">Responsable</TableHead>
                                <TableHead className="font-bold text-slate-700">Acción</TableHead>
                                <TableHead className="font-bold text-slate-700">Módulo</TableHead>
                                <TableHead className="font-bold text-slate-700">Detalles del Cambio</TableHead>
                                <TableHead className="text-right font-bold text-slate-700">Fecha</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} className="h-24 text-center">Cargando...</TableCell></TableRow>
                            ) : logs.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="h-24 text-center text-slate-500">No hay movimientos registrados.</TableCell></TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id} className="hover:bg-slate-50/50">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-900 text-sm">
                                                        {log.user ? log.user.name : "Sistema"}
                                                    </span>
                                                    {/* <span className="text-[10px] text-slate-400 uppercase">
                                                        IP: {log.ip_address}
                                                    </span> */}
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell>{getEventBadge(log.event)}</TableCell>

                                        <TableCell>
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <LayoutGrid className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm font-medium">{formatModel(log.auditable_type)}</span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="align-top py-3">
                                            {renderDetails(log)}
                                        </TableCell>

                                        <TableCell className="text-right text-slate-500 text-sm">
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
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User } from "lucide-react";
import { AuditEventBadge } from "./AuditEventBadge";
import { AuditDetails } from "./AuditDetails";
import { MODEL_TRANSLATIONS } from "@/lib/constants";

// Formato de fecha
const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("es-ES", {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

// Formatear modelo
const formatModel = (model: string) => {
    const cleanName = model.split('\\').pop() || model;
    return MODEL_TRANSLATIONS[cleanName] || cleanName;
};

interface AuditLog {
    id: string;
    user?: { name: string } | null;
    event: string;
    auditable_type: string;
    auditable_name?: string;
    old_values: Record<string, any>;
    new_values: Record<string, any>;
    created_at: string;
}

interface AuditTableProps {
    logs: AuditLog[];
    loading: boolean;
}

export function AuditTable({ logs, loading }: AuditTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent bg-slate-50 dark:bg-slate-800">
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-xs w-[160px]">RESPONSABLE</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-xs w-[90px]">ACCIÓN</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-xs w-[130px]">MÓDULO</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-xs">DETALLES</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300 text-xs w-[100px]">FECHA</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={5} className="h-24 text-center text-slate-500 text-xs">Cargando historial...</TableCell></TableRow>
                ) : logs.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="h-24 text-center text-slate-500 text-xs">Sin registros.</TableCell></TableRow>
                ) : (
                    logs.map((log) => (
                        <TableRow key={log.id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 group border-b border-slate-50 dark:border-slate-800">
                            <TableCell className="py-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-600 flex items-center justify-center border border-indigo-200/50">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium text-slate-800 dark:text-slate-200 text-sm">
                                        {log.user ? log.user.name : "Sistema"}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell className="py-4">
                                <AuditEventBadge event={log.event} />
                            </TableCell>
                            <TableCell className="py-4">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{formatModel(log.auditable_type)}</span>
                                    {log.auditable_name && (
                                        <span className="text-[11px] text-slate-400 dark:text-slate-500">{log.auditable_name}</span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="py-4">
                                <AuditDetails log={log} />
                            </TableCell>
                            <TableCell className="text-right py-4 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
                                {formatDate(log.created_at)}
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
}

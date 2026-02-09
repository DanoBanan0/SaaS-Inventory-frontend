"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { DataFilters } from "@/components/common/DataFilters";
import { AuditTable } from "@/components/audits/AuditTable";
import { usePagination } from "@/hooks/usePagination";
import Swal from "sweetalert2";

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

export default function AuditsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const { pagination, setPagination, handlePageChange } = usePagination();

    const fetchLogs = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            if (searchText) params.append('search', searchText);
            if (dateFilter) params.append('date', dateFilter);

            const res = await api.get(`/audits?${params.toString()}`);
            const allLogs = res.data.data || [];

            // Filtrar asignaciones del cliente
            const cleanLogs = allLogs.filter((log: AuditLog) =>
                !log.auditable_type.includes('Assignment')
            );

            setLogs(cleanLogs);
            setPagination(res.data);
        } catch (error: any) {
            console.error("Error cargando auditoría", error);
            setLogs([]);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo cargar el historial de auditoría",
                confirmButtonColor: "#1e40af"
            });
        } finally {
            setLoading(false);
        }
    }, [searchText, dateFilter, setPagination]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLogs(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchLogs]);

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
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1">Fecha</span>
                    <Input
                        type="date"
                        className="bg-white dark:bg-slate-900 dark:border-slate-600 dark:text-slate-100 w-full"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    />
                </div>
            </DataFilters>

            {/* TABLA */}
            <Card className="shadow-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> Movimientos del Sistema
                        </CardTitle>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                            {pagination.from || 0} - {pagination.to || 0} de {pagination.total} registros
                        </span>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <AuditTable logs={logs} loading={loading} />
                </CardContent>

                {/* PAGINACIÓN */}
                <div className="flex items-center justify-end p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400 mr-4">
                        Página <span className="font-medium text-slate-900 dark:text-slate-100">{pagination.current_page}</span> de <span className="font-medium text-slate-900 dark:text-slate-100">{pagination.last_page}</span>
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.current_page - 1, fetchLogs)}
                        disabled={pagination.current_page === 1 || loading}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.current_page + 1, fetchLogs)}
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
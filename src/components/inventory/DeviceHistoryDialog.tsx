"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, History, User } from "lucide-react";

interface DeviceHistoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    deviceId: string | null;
}

export function DeviceHistoryDialog({ open, onOpenChange, deviceId }: DeviceHistoryDialogProps) {
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<any[]>([]);

    const [inventoryCode, setInventoryCode] = useState("");

    useEffect(() => {
        if (open && deviceId) {
            fetchHistory();
        } else {
            setHistory([]);
            setLoading(true);
        }
    }, [open, deviceId]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/devices/${deviceId}`);
            const deviceData = res.data;

            setInventoryCode(deviceData.inventory_code);

            const sortedHistory = (deviceData.assignments || []).sort((a: any, b: any) =>
                new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime()
            );

            setHistory(sortedHistory);
        } catch (error) {
            console.error("Error cargando historial", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleString("es-SV", {
            day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="w-5 h-5 text-blue-600" />
                        Historial de Asignaciones: <span className="text-slate-500 font-mono font-normal">{inventoryCode}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-4 flex-1 overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-md border border-dashed border-slate-200">
                            No hay registros de asignación para este equipo.
                        </div>
                    ) : (
                        <div className="w-full rounded-md border border-slate-200 overflow-x-auto">
                            <Table className="min-w-full">
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="whitespace-nowrap">Empleado</TableHead>
                                        <TableHead className="whitespace-nowrap">Fecha Asignación</TableHead>
                                        <TableHead className="whitespace-nowrap">Fecha Devolución</TableHead>
                                        <TableHead>Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {history.map((record) => (
                                        <TableRow key={record.id}>
                                            <TableCell className="font-medium whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-3 h-3 text-slate-400" />
                                                    {record.employee ? record.employee.name : "Desconocido"}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                                                {formatDate(record.assigned_at)}
                                            </TableCell>
                                            <TableCell className="text-sm whitespace-nowrap">
                                                {record.returned_at ? (
                                                    <span className="text-slate-500">{formatDate(record.returned_at)}</span>
                                                ) : (
                                                    <span className="text-slate-400 font-mono">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {record.returned_at ? (
                                                    <Badge variant="outline" className="text-slate-500 border-slate-200 bg-slate-50">
                                                        Devuelto
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">
                                                        Asignado
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
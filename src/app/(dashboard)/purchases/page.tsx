"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Trash2, Pencil, Package } from "lucide-react";
import Swal from "sweetalert2";
import { CreatePurchaseDialog } from "@/components/purchases/CreatePurchaseDialog";
import { EditPurchaseDialog } from "@/components/purchases/EditPurchaseDialog";
import { DataFilters } from "@/components/common/DataFilters";

export default function PurchasesPage() {
    const [purchases, setPurchases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados de Filtros
    const [search, setSearch] = useState("");
    const [dateFilter, setDateFilter] = useState(""); // <--- Nuevo Estado para la fecha

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState<any>(null);

    const fetchPurchases = useCallback(async () => {
        setLoading(true);
        try {
            // Construimos los parámetros URL
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (dateFilter) params.append('date', dateFilter); // <--- Enviamos la fecha

            const res = await api.get(`/purchases?${params.toString()}`);
            setPurchases(res.data.data || res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [search, dateFilter]); // <--- Reacciona a cambios en search o dateFilter

    useEffect(() => {
        const timer = setTimeout(() => fetchPurchases(), 300);
        return () => clearTimeout(timer);
    }, [fetchPurchases]);

    const clearFilters = () => {
        setSearch("");
        setDateFilter("");
    };

    const handleEdit = (item: any) => {
        setSelectedPurchase(item);
        setIsEditOpen(true);
    };

    const handleDelete = (id: string) => {
        Swal.fire({
            title: "¿Eliminar Factura?",
            text: "Si tiene equipos registrados, no se podrá borrar.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            confirmButtonColor: "#d33"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/purchases/${id}`);
                    Swal.fire("Eliminado", "La factura ha sido eliminada.", "success");
                    fetchPurchases();
                } catch (error: any) {
                    Swal.fire("No se puede eliminar", error.response?.data?.message || "Error desconocido", "error");
                }
            }
        });
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        // Ajustamos la zona horaria para visualización correcta
        const date = new Date(dateString);
        return date.toLocaleDateString("es-SV", {
            year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
        });
    };

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <ShoppingCart className="h-6 w-6 text-blue-600" />
                        Registro de Compras
                    </h1>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-700 hover:bg-blue-800">
                    <Plus className="mr-2 h-4 w-4" /> Registrar Factura
                </Button>
            </div>

            {/* BARRA DE FILTROS (DISEÑO GRID) */}
            <DataFilters
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder=""
                searchColSpan="md:col-span-3 lg:col-span-3"
                clearColSpan="md:col-span-1"
                hasActiveFilters={!!(search || dateFilter)}
                onClear={clearFilters}
            >
                {/* FILTROS ESPECÍFICOS (4 Columnas restantes) */}
                <div className="col-span-1 md:col-span-2 lg:col-span-2 space-y-1">
                    <span className="text-xs font-medium text-slate-500 ml-1">Fecha de Compra</span>
                    <Input
                        type="date"
                        className="bg-white"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    />
                </div>
            </DataFilters>

            {/* TABLA */}
            <Card>
                <CardContent className="p-0 overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-100">
                            <TableRow>
                                <TableHead className="font-bold text-slate-700">Proveedor</TableHead>
                                <TableHead className="font-bold text-slate-700">N° Factura</TableHead>
                                <TableHead className="font-bold text-slate-700">Monto</TableHead>
                                <TableHead className="font-bold text-slate-700">Fecha</TableHead>
                                <TableHead className="font-bold text-slate-700 text-center">Items</TableHead>
                                <TableHead className="text-right font-bold text-slate-700 pr-6">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} className="h-24 text-center">Cargando...</TableCell></TableRow>
                            ) : purchases.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="h-24 text-center text-slate-500">No se encontraron resultados.</TableCell></TableRow>
                            ) : (
                                purchases.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-slate-50/50">
                                        <TableCell className="font-medium text-slate-900">
                                            {item.provider}
                                        </TableCell>
                                        <TableCell className="font-mono text-slate-600">
                                            {item.invoice_number}
                                        </TableCell>
                                        <TableCell className="text-slate-700 font-medium">
                                            ${item.total_amount}
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(item.purchase_date)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-100">
                                                <Package className="w-3 h-3 mr-1" />
                                                {item.devices_count || 0}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-1">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                                <Pencil className="w-4 h-4 text-slate-400 hover:text-blue-600" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                                                <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <CreatePurchaseDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onSuccess={fetchPurchases}
            />

            <EditPurchaseDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                purchase={selectedPurchase}
                onSuccess={fetchPurchases}
            />
        </div>
    );
}
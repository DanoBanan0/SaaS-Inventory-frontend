"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Box, ChevronRight, Loader2 } from "lucide-react";
// Importaremos el modal aquí abajo en un momento
import { CreateCategoryDialog } from "@/components/inventory/CreateCategoryDialog";
import { canManageSystem } from "@/lib/permissions";
import { useAuth } from "@/hooks/useAuth";

interface Category {
    id: string;
    name: string;
}

export default function InventoryPage() {
    const router = useRouter();
    const { user } = useAuth();
    const isSuperAdmin = canManageSystem(user?.role?.name);

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false); // Estado para abrir el modal

    const fetchCategories = async () => {
        try {
            const res = await api.get("/categories");
            setCategories(res.data.data || res.data);
        } catch (error) {
            console.error("Error cargando categorías", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <div className="space-y-8">
            {/* HEADER LIMPIO */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Inventario General
                    </h1>
                </div>

                {/* Botón que abre el Modal - Solo visible para admin/developer/administrador */}
                {isSuperAdmin && (
                    <Button
                        className="bg-blue-700 hover:bg-blue-800 text-white shadow-lg"
                        onClick={() => setIsCreateOpen(true)}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Nueva Categoría
                    </Button>
                )}
            </div>

            {/* GRID DE TARJETAS */}
            {loading ? (
                <div className="flex h-40 items-center justify-center text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin mr-2" /> Cargando...
                </div>
            ) : categories.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
                    <Box className="mx-auto h-12 w-12 text-slate-300" />
                    <h3 className="mt-2 text-lg font-medium text-slate-900">No hay categorías</h3>
                    <p className="text-sm text-slate-500 mb-4">Empiece definiendo la primera.</p>
                    {isSuperAdmin && (
                        <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
                            Crear Categoría
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {categories.map((category) => (
                        <Card
                            key={category.id}
                            className="group cursor-pointer hover:shadow-lg hover:border-blue-500/50 transition-all duration-300 bg-white"
                            onClick={() => router.push(`/inventory/${category.id}`)}
                        >
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-lg font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                                    {category.name}
                                </CardTitle>
                                <div className="p-2 bg-slate-100 rounded-full group-hover:bg-blue-100 transition-colors">
                                    <Box className="h-5 w-5 text-slate-500 group-hover:text-blue-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-sm text-slate-400 font-medium">Ver dispositivos</span>
                                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* MODAL DE CREACIÓN (Lo crearemos ahora) */}
            <CreateCategoryDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onSuccess={fetchCategories}
            />
        </div>
    );
}
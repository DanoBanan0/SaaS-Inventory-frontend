"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShieldCheck, Monitor, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Consumimos el endpoint que creamos en el Backend
    api.get("/dashboard")
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Error cargando dashboard:", err));
  }, []);

  if (!stats) return <div className="p-4">Cargando estadísticas...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Panel Principal</h1>

      {/* Tarjetas de Resumen */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-600 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Dispositivos</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{stats.total_devices}</div>
            <p className="text-xs text-slate-500">En todo el sistema</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Disponibles</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{stats.available_devices}</div>
            <p className="text-xs text-slate-500">Listos para asignar</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Asignados</CardTitle>
            <Monitor className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{stats.assigned_devices}</div>
            <p className="text-xs text-slate-500">En uso por empleados</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Mantenimiento</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{stats.maintenance_devices}</div>
            <p className="text-xs text-slate-500">Requieren atención</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
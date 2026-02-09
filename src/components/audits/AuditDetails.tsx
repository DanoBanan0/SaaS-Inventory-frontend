"use client";

import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, ArrowRight } from "lucide-react";
import { FIELD_TRANSLATIONS, MODULE_CONFIG, MODEL_TRANSLATIONS } from "@/lib/constants";

// Obtener etiqueta de campo
const getFieldLabel = (key: string) => FIELD_TRANSLATIONS[key] || key.replace(/_/g, " ");

// Formatear modelo
const formatModel = (model: string) => {
    const cleanName = model.split('\\').pop() || model;
    return MODEL_TRANSLATIONS[cleanName] || cleanName;
};

// Formatear valores de auditoría
const formatAuditValue = (key: string, value: any) => {
    if (value === null || value === "" || value === undefined || value === "null") return null;

    // Ocultar IDs técnicos (UUIDs largos)
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

interface AuditDetailsProps {
    log: {
        event: string;
        auditable_type: string;
        old_values: Record<string, any>;
        new_values: Record<string, any>;
    };
}

export function AuditDetails({ log }: AuditDetailsProps) {
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
        const items: React.ReactNode[] = [];
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
    const changes: React.ReactNode[] = [];
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
}

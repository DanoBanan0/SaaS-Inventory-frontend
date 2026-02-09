"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, FileType } from "lucide-react";
import { useExport } from "@/hooks/useExport";
import { useMemo } from "react";

interface CategoryField {
    key: string;
    label: string;
}

interface ExportButtonProps {
    data: Record<string, any>[];
    filename: string;
    disabled?: boolean;
    categoryFields?: CategoryField[];
}

export function ExportButton({ data, filename, disabled, categoryFields = [] }: ExportButtonProps) {
    const { exportToCSV, exportToExcel, exportToPDF } = useExport();

    // Construir columnas y headers dinámicamente
    const { columns, headers, processedData } = useMemo(() => {
        // Columnas base (sin estado ni acciones)
        const baseColumns = [
            'employee_name',
            'unit_name',
            'inventory_code',
            'brand',
            'model',
            'serial_number',
        ];

        const baseHeaders = [
            'Nombre',
            'Unidad',
            'Cód. Inventario',
            'Marca',
            'Modelo',
            'Serial',
        ];

        // Agregar campos dinámicos de la categoría
        const dynamicColumns = categoryFields.map(f => `specs_${f.key}`);
        const dynamicHeaders = categoryFields.map(f => f.label);

        // Columnas finales (comentario y última edición al final)
        const finalColumns = [
            ...baseColumns,
            ...dynamicColumns,
            'comments',
            'updated_at'
        ];

        const finalHeaders = [
            ...baseHeaders,
            ...dynamicHeaders,
            'Comentario',
            'Última Edición'
        ];

        // Procesar datos para aplanar objetos anidados
        const processed = data.map(device => {
            const row: Record<string, any> = {
                employee_name: device.employee?.name || '-- Sin Asignar --',
                unit_name: device.employee?.unit?.name || '-',
                inventory_code: device.inventory_code || '',
                brand: device.brand || '',
                model: device.model || '',
                serial_number: device.serial_number || '',
                comments: device.comments || '-',
                updated_at: device.updated_at
                    ? new Date(device.updated_at).toLocaleString('es-SV', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                    })
                    : '-',
            };

            // Agregar campos dinámicos de specs
            categoryFields.forEach(field => {
                row[`specs_${field.key}`] = device.specs?.[field.key] || '-';
            });

            return row;
        });

        return { columns: finalColumns, headers: finalHeaders, processedData: processed };
    }, [data, categoryFields]);

    const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
        const options = { filename, headers, data: processedData, columns };
        if (format === 'csv') {
            exportToCSV(options);
        } else if (format === 'excel') {
            exportToExcel(options);
        } else {
            exportToPDF(options);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={disabled || data.length === 0}
                    className="gap-2"
                >
                    <Download className="h-4 w-4" />
                    Exportar
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('excel')} className="gap-2 cursor-pointer">
                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                    Excel (.xls)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')} className="gap-2 cursor-pointer">
                    <FileText className="h-4 w-4 text-blue-600" />
                    CSV (.csv)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')} className="gap-2 cursor-pointer">
                    <FileType className="h-4 w-4 text-red-600" />
                    PDF (.pdf)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}


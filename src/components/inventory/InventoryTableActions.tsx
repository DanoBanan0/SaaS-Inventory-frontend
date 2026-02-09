"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface CategoryField {
    key: string;
    label: string;
}

interface InventoryTableActionsProps {
    data: any[];
    categoryName: string;
    categoryFields?: CategoryField[];
}

export function InventoryTableActions({ data, categoryName, categoryFields = [] }: InventoryTableActionsProps) {

    const handlePrintTable = () => {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const filename = `Inventario_${categoryName}_${format(new Date(), "dd-MM-yyyy")}`;

        // Título del documento
        doc.setFontSize(18);
        doc.setTextColor(30, 64, 175); // Azul
        doc.text(`INVENTARIO - ${categoryName.toUpperCase()}`, 14, 15);

        // Fecha de generación
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generado: ${new Date().toLocaleString('es-SV')}`, 14, 22);

        // Construir headers dinámicamente
        const baseHeaders = [
            'Nombre',
            'Unidad',
            'Cód. Inventario',
            'Marca',
            'Modelo',
            'Serial',
        ];
        const dynamicHeaders = categoryFields.map(f => f.label);
        const finalHeaders = [
            ...baseHeaders,
            ...dynamicHeaders,
            'Comentario',
            'Última Edición'
        ];

        // Preparar datos de la tabla
        const tableData = data.map(device => {
            const baseRow = [
                device.employee?.name || '-- Sin Asignar --',
                device.employee?.unit?.name || '-',
                device.inventory_code || '',
                device.brand || '',
                device.model || '',
                device.serial_number || '',
            ];

            // Agregar campos dinámicos
            const dynamicData = categoryFields.map(field =>
                device.specs?.[field.key] || '-'
            );

            // Agregar comentarios y fecha
            const endData = [
                device.comments || '-',
                device.updated_at
                    ? new Date(device.updated_at).toLocaleString('es-SV', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                    })
                    : '-',
            ];

            return [...baseRow, ...dynamicData, ...endData];
        });

        // Generar tabla con autoTable
        autoTable(doc, {
            head: [finalHeaders],
            body: tableData,
            startY: 28,
            styles: {
                fontSize: 8,
                cellPadding: 2,
                overflow: 'linebreak',
            },
            headStyles: {
                fillColor: [30, 64, 175],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 7,
            },
            alternateRowStyles: {
                fillColor: [245, 247, 250],
            },
            columnStyles: {
                0: { cellWidth: 'auto' }, // Nombre
                6: { cellWidth: 'auto' }, // Comentario (puede ser largo)
            },
            margin: { top: 28, right: 10, bottom: 10, left: 10 },
            tableWidth: 'auto',
        });

        // Abrir PDF en nueva ventana para imprimir
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const printWindow = window.open(pdfUrl);

        if (printWindow) {
            printWindow.onload = () => {
                printWindow.print();
            };
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            className="h-8 gap-2 bg-white hover:bg-slate-50 text-slate-700 border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-600"
            onClick={handlePrintTable}
            disabled={data.length === 0}
        >
            <Printer className="h-4 w-4 text-blue-600" />
            <span className="hidden sm:inline">Imprimir</span>
        </Button>
    );
}

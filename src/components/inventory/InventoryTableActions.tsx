"use client";

import { Button } from "@/components/ui/button";
import { Printer, FileSpreadsheet } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import * as XLSX from 'xlsx';
import { format } from "date-fns";
import React from "react"; // Asegúrate de importar React

interface InventoryTableActionsProps {
    // CORRECCIÓN AQUÍ: Agregamos "| null" para que acepte el useRef(null)
    tableRef: React.RefObject<HTMLDivElement | null>;
    data: any[];
    categoryName: string;
}

export function InventoryTableActions({ tableRef, data, categoryName }: InventoryTableActionsProps) {

    const handlePrintTable = useReactToPrint({
        contentRef: tableRef,
        documentTitle: `Inventario_${categoryName}_${format(new Date(), "dd-MM-yyyy")}`,
        pageStyle: `
      @page { size: landscape; margin: 15mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .actions-cell { display: none !important; } 
      }
    `,
    });

    const handleExportExcel = () => {
        if (!data || data.length === 0) {
            alert("No hay datos para exportar");
            return;
        }

        const formattedData = data.map(item => {
            // Aplanamos el objeto para que el Excel quede limpio
            // Creamos un objeto base con lo común
            const row: any = {
                "Código Inventario": item.inventory_code,
                "Marca": item.brand,
                "Modelo": item.model,
                "Serie": item.serial_number,
                "Estado": item.status === 'assigned' ? 'Asignado' :
                    item.status === 'available' ? 'Disponible' :
                        item.status === 'maintenance' ? 'Mantenimiento' : 'Descargo',
                "Asignado a": item.employee ? item.employee.name : "Sin asignar",
                "Unidad": item.employee?.unit ? item.employee.unit.name : "-",
                "Fecha Registro": new Date(item.created_at).toLocaleDateString("es-SV"),
            };

            // Agregamos las columnas dinámicas (RAM, Disco, etc) si existen
            if (item.specs) {
                Object.keys(item.specs).forEach(key => {
                    // Intentamos poner la primera letra mayúscula para que se vea bien
                    const label = key.charAt(0).toUpperCase() + key.slice(1);
                    row[label] = item.specs[key];
                });
            }

            row["Comentarios"] = item.comments || "";
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario");

        // Ajuste ancho columnas
        const wscols = Object.keys(formattedData[0] || {}).map(() => ({ wch: 20 }));
        worksheet["!cols"] = wscols;

        const fileName = `Inventario_${categoryName}_${format(new Date(), "dd-MM-yyyy_HHmm")}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                className="h-8 gap-2 bg-white hover:bg-slate-50 text-slate-700 border-slate-300"
                onClick={() => handlePrintTable()}
            >
                <Printer className="h-4 w-4 text-blue-600" />
                <span className="hidden sm:inline">Imprimir Vista</span>
            </Button>

            <Button
                variant="outline"
                size="sm"
                className="h-8 gap-2 bg-white hover:bg-slate-50 text-slate-700 border-slate-300"
                onClick={handleExportExcel}
            >
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                <span className="hidden sm:inline">Exportar Excel</span>
            </Button>
        </div>
    );
}
"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { format } from "date-fns";
import React from "react";

interface InventoryTableActionsProps {
    tableRef: React.RefObject<HTMLDivElement | null>;
    data: any[];
    categoryName: string;
}

export function InventoryTableActions({ tableRef, categoryName }: InventoryTableActionsProps) {

    const handlePrintTable = useReactToPrint({
        contentRef: tableRef,
        documentTitle: `Inventario_${categoryName}_${format(new Date(), "dd-MM-yyyy")}`,
        pageStyle: `
            @page { 
                size: landscape; 
                margin: 8mm; 
            }
            @media print {
                html, body {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    width: 100%;
                    height: 100%;
                    margin: 0;
                    padding: 0;
                }
                
                /* Container principal */
                .print-container {
                    width: 100% !important;
                    max-width: 100% !important;
                    overflow: visible !important;
                }
                
                /* Tabla ajustada al ancho de página */
                table {
                    width: 100% !important;
                    table-layout: fixed !important;
                    font-size: 9px !important;
                    border-collapse: collapse !important;
                }
                
                th, td {
                    padding: 4px 6px !important;
                    font-size: 9px !important;
                    word-wrap: break-word !important;
                    overflow-wrap: break-word !important;
                    white-space: normal !important;
                    border: 1px solid #e2e8f0 !important;
                }
                
                th {
                    background-color: #f1f5f9 !important;
                    font-weight: 600 !important;
                    text-transform: uppercase !important;
                    font-size: 8px !important;
                }
                
                /* Ocultar columna de acciones */
                .actions-cell { 
                    display: none !important; 
                }
                
                /* Ajustar badges */
                .badge, [class*="badge"] {
                    font-size: 8px !important;
                    padding: 2px 4px !important;
                }
                
                /* Ocultar elementos innecesarios */
                button, .no-print {
                    display: none !important;
                }
                
                /* Scroll container visible */
                [class*="overflow-x-auto"], 
                [class*="overflow-auto"] {
                    overflow: visible !important;
                }
            }
        `,
    });

    return (
        <Button
            variant="outline"
            size="sm"
            className="h-8 gap-2 bg-white hover:bg-slate-50 text-slate-700 border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-600"
            onClick={() => handlePrintTable()}
        >
            <Printer className="h-4 w-4 text-blue-600" />
            <span className="hidden sm:inline">Imprimir</span>
        </Button>
    );
}

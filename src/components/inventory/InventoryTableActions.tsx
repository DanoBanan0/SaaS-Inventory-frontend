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
                margin: 5mm; 
            }
            @media print {
                html, body {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
                
                /* Escalar todo el contenedor para que quepa */
                .print-container {
                    width: 100% !important;
                    transform: scale(0.75);
                    transform-origin: top left;
                }
                
                /* Tabla compacta */
                table {
                    width: 100% !important;
                    table-layout: auto !important;
                    font-size: 7px !important;
                    border-collapse: collapse !important;
                }
                
                th, td {
                    padding: 2px 3px !important;
                    font-size: 7px !important;
                    white-space: nowrap !important;
                    border: 0.5px solid #cbd5e1 !important;
                    max-width: 100px !important;
                    overflow: hidden !important;
                    text-overflow: ellipsis !important;
                }
                
                th {
                    background-color: #e2e8f0 !important;
                    font-weight: 700 !important;
                    text-transform: uppercase !important;
                    font-size: 6px !important;
                    letter-spacing: 0.3px !important;
                }
                
                /* Ocultar columna de acciones */
                .actions-cell, 
                th:last-child, 
                td:last-child {
                    display: none !important;
                }
                
                /* Badges más compactos */
                .badge, [class*="badge"] {
                    font-size: 6px !important;
                    padding: 1px 2px !important;
                }
                
                /* Ocultar elementos innecesarios */
                button, .no-print, nav, header {
                    display: none !important;
                }
                
                /* Scroll container visible */
                [class*="overflow"] {
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

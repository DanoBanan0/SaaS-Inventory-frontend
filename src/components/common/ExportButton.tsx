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

interface ExportButtonProps {
    data: Record<string, any>[];
    columns: string[];
    headers: string[];
    filename: string;
    disabled?: boolean;
}

export function ExportButton({ data, columns, headers, filename, disabled }: ExportButtonProps) {
    const { exportToCSV, exportToExcel, exportToPDF } = useExport();

    const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
        const options = { filename, headers, data, columns };
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


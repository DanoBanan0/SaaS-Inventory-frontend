import { useCallback } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type ExportFormat = 'csv' | 'excel' | 'pdf';

interface ExportOptions {
    filename: string;
    headers: string[];
    data: Record<string, any>[];
    columns: string[];
}

export function useExport() {
    const exportToPDF = useCallback(({ filename, headers, data, columns }: ExportOptions) => {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        // Título del documento
        doc.setFontSize(16);
        doc.setTextColor(30, 64, 175); // Azul
        doc.text(filename.replace(/_/g, ' ').toUpperCase(), 14, 15);

        // Fecha de generación
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generado: ${new Date().toLocaleString('es-SV')}`, 14, 22);

        // Preparar datos de la tabla
        const tableData = data.map(row =>
            columns.map(col => {
                const value = row[col];
                if (value === null || value === undefined) return '';
                if (typeof value === 'object') return value.name || JSON.stringify(value);
                return String(value);
            })
        );

        // Generar tabla con autoTable
        autoTable(doc, {
            head: [headers],
            body: tableData,
            startY: 28,
            styles: {
                fontSize: 9,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [30, 64, 175],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
            },
            alternateRowStyles: {
                fillColor: [245, 247, 250],
            },
            margin: { top: 28, right: 14, bottom: 14, left: 14 },
        });

        doc.save(`${filename}.pdf`);
    }, []);

    const exportToCSV = useCallback(({ filename, headers, data, columns }: ExportOptions) => {
        const csvHeader = headers.join(',');
        const csvRows = data.map(row =>
            columns.map(col => {
                const value = row[col];
                if (value === null || value === undefined) return '';
                const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
                return `"${stringValue.replace(/"/g, '""')}"`;
            }).join(',')
        );

        const csvContent = [csvHeader, ...csvRows].join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        downloadBlob(blob, `${filename}.csv`);
    }, []);

    const exportToExcel = useCallback(({ filename, headers, data, columns }: ExportOptions) => {
        const tableHtml = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
            <head><meta charset="UTF-8"></head>
            <body>
                <table border="1">
                    <thead><tr>${headers.map(h => `<th style="background:#1e40af;color:white;font-weight:bold;padding:8px;">${h}</th>`).join('')}</tr></thead>
                    <tbody>
                        ${data.map(row => `<tr>${columns.map(col => {
            const value = row[col];
            const displayValue = value === null || value === undefined ? '' :
                (typeof value === 'object' ? (value.name || JSON.stringify(value)) : String(value));
            return `<td style="padding:6px;border:1px solid #ddd;">${displayValue}</td>`;
        }).join('')}</tr>`).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        downloadBlob(blob, `${filename}.xls`);
    }, []);

    const downloadBlob = (blob: Blob, filename: string) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    return { exportToCSV, exportToExcel, exportToPDF };
}

import { useCallback } from "react";

type ExportFormat = 'csv' | 'excel';

interface ExportOptions {
    filename: string;
    headers: string[];
    data: Record<string, any>[];
    columns: string[];
}

export function useExport() {
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

    return { exportToCSV, exportToExcel };
}

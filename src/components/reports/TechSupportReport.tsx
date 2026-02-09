import React from "react";

export interface ReportData {
    fechaRecibido: string;
    horaRecibido: string;
    fechaEntrega: string;
    horaEntrega: string;
    noReporte: string;
    nombreUsuario: string;
    unidadUsuario: string;
    correoUsuario: string;
    telefonoUsuario: string;
    tipoEquipo: string;
    marca: string;
    modelo: string;
    serie: string;
    codigoActivo: string;
    observaciones: string;
}

// Estilos inline para asegurar que siempre se vea en modo claro
const styles = {
    container: {
        width: '216mm',
        minHeight: '279mm',
        padding: '12mm',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#ffffff',
        color: '#000000',
        colorScheme: 'light' as const,
        boxSizing: 'border-box' as const,
    },
    header: {
        color: '#002060',
        fontWeight: 'bold',
        fontSize: '14px',
        lineHeight: '1.2',
    },
    subHeader: {
        color: '#000000',
        fontWeight: 'bold',
        fontSize: '11px',
        textTransform: 'uppercase' as const,
    },
    sectionHeader: {
        backgroundColor: '#d9d9d9',
        color: '#000000',
        fontWeight: 'bold',
        fontSize: '11px',
        padding: '4px 0',
        textAlign: 'center' as const,
        borderBottom: '1px solid #000000',
    },
    sectionBorder: {
        border: '1px solid #000000',
        marginBottom: '16px',
    },
    label: {
        fontSize: '11px',
        fontWeight: 500,
        color: '#000000',
        marginRight: '4px',
        whiteSpace: 'nowrap' as const,
    },
    underline: {
        flex: 1,
        borderBottom: '1px solid #000000',
        textAlign: 'center' as const,
        fontSize: '11px',
        paddingLeft: '8px',
        paddingRight: '8px',
        lineHeight: '1',
        paddingBottom: '2px',
        fontWeight: 500,
        color: '#000000',
    },
    tableCell: {
        border: '1px solid #000000',
        padding: '4px',
        fontSize: '10px',
        color: '#000000',
        textAlign: 'center' as const,
    },
    tableCellHeader: {
        border: '1px solid #000000',
        padding: '4px',
        fontSize: '10px',
        fontWeight: 'bold',
        fontStyle: 'italic' as const,
        color: '#000000',
        textAlign: 'center' as const,
    },
};

export const TechSupportReport = React.forwardRef<HTMLDivElement, { data: ReportData }>(
    ({ data }, ref) => {

        const UnderlinedField = ({ label, value, className = "" }: { label: string, value: string, className?: string }) => (
            <div className={`flex items-end ${className}`}>
                <span style={styles.label}>{label}</span>
                <div style={styles.underline}>{value}</div>
            </div>
        );

        return (
            <div ref={ref} style={styles.container} className="mx-auto">
                {/* --- ENCABEZADO --- */}
                <div className="flex justify-between items-start mb-6 h-20">
                    <div className="w-24 h-20 flex items-center justify-start">
                        <img src="/logo-indes.png" alt="INDES" className="h-auto w-full object-contain" />
                    </div>

                    <div className="flex-1 px-4 text-center pt-2">
                        <h1 style={styles.header}>
                            INSTITUTO NACIONAL DE LOS DEPORTES DE EL SALVADOR
                        </h1>
                        <h2 style={{ ...styles.subHeader, marginTop: '4px' }}>
                            UNIDAD DE TECNOLOGÍAS DE INFORMACIÓN- SOPORTE TÉCNICO
                        </h2>
                    </div>

                    <div className="w-24 h-20 flex items-center justify-end">
                        <img src="/logo-gob.png" alt="Gobierno" className="h-auto w-full object-contain" />
                    </div>
                </div>

                {/* --- SECCIÓN 1: FECHAS --- */}
                <div className="mb-4 px-1 space-y-2">
                    <div className="flex gap-8 items-end">
                        <UnderlinedField label="Fecha de Recibido:" value={data.fechaRecibido} className="w-[30%]" />
                        <UnderlinedField label="Fecha de Entrega:" value={data.fechaEntrega} className="w-[30%]" />
                        <div className="flex-1 flex justify-end items-end">
                            <span style={styles.label}>No Reporte:</span>
                            <div style={{ ...styles.underline, width: '80px', flex: 'none' }}>
                                {data.noReporte}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-8 items-end">
                        <UnderlinedField label="Hora de Recibido:" value={data.horaRecibido} className="w-[30%]" />
                        <UnderlinedField label="Hora Entregado:" value={data.horaEntrega} className="w-[30%]" />
                        <div className="flex-1"></div>
                    </div>
                </div>

                {/* --- SECCIÓN 2: DATOS DEL USUARIO --- */}
                <div style={styles.sectionBorder}>
                    <div style={styles.sectionHeader}>
                        Datos del Usuario
                    </div>
                    <div className="p-2 space-y-2">
                        <div className="flex gap-4">
                            <UnderlinedField label="Nombre :" value={data.nombreUsuario} className="flex-[2]" />
                            <UnderlinedField label="Correo:" value={data.correoUsuario} className="flex-1" />
                        </div>
                        <div className="flex gap-4">
                            <UnderlinedField label="Unidad:" value={data.unidadUsuario} className="flex-[2]" />
                            <UnderlinedField label="Teléfono:" value={data.telefonoUsuario} className="flex-1" />
                        </div>
                    </div>
                </div>

                {/* --- SECCIÓN 3: DESCRIPCIÓN DEL EQUIPO --- */}
                <div style={styles.sectionBorder}>
                    <div style={styles.sectionHeader}>
                        Descripción del Equipo (Si Aplica)
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ ...styles.tableCellHeader, width: '20%', borderTop: 'none' }}>Equipo</th>
                                <th style={{ ...styles.tableCellHeader, width: '20%', borderTop: 'none', borderLeft: 'none' }}>Marca</th>
                                <th style={{ ...styles.tableCellHeader, width: '20%', borderTop: 'none', borderLeft: 'none' }}>Modelo</th>
                                <th style={{ ...styles.tableCellHeader, width: '20%', borderTop: 'none', borderLeft: 'none' }}>Serie</th>
                                <th style={{ ...styles.tableCellHeader, width: '20%', borderTop: 'none', borderLeft: 'none' }}>Código Activo</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ height: '24px' }}>
                                <td style={{ ...styles.tableCell, borderTop: 'none' }}>{data.tipoEquipo}</td>
                                <td style={{ ...styles.tableCell, borderTop: 'none', borderLeft: 'none' }}>{data.marca}</td>
                                <td style={{ ...styles.tableCell, borderTop: 'none', borderLeft: 'none' }}>{data.modelo}</td>
                                <td style={{ ...styles.tableCell, borderTop: 'none', borderLeft: 'none' }}>{data.serie}</td>
                                <td style={{ ...styles.tableCell, borderTop: 'none', borderLeft: 'none' }}>{data.codigoActivo}</td>
                            </tr>
                            {[1, 2, 3, 4].map((i) => (
                                <tr key={i} style={{ height: '24px' }}>
                                    <td style={{ ...styles.tableCell, borderTop: 'none' }}></td>
                                    <td style={{ ...styles.tableCell, borderTop: 'none', borderLeft: 'none' }}></td>
                                    <td style={{ ...styles.tableCell, borderTop: 'none', borderLeft: 'none' }}></td>
                                    <td style={{ ...styles.tableCell, borderTop: 'none', borderLeft: 'none' }}></td>
                                    <td style={{ ...styles.tableCell, borderTop: 'none', borderLeft: 'none' }}></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* --- SECCIÓN 4: DIAGNÓSTICO --- */}
                <div style={{ ...styles.sectionBorder, marginBottom: '8px' }}>
                    <div style={styles.sectionHeader}>
                        Diagnostico :
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ ...styles.tableCell, width: '33%', fontWeight: 'normal', borderTop: 'none' }}>Falla</th>
                                <th style={{ ...styles.tableCell, width: '33%', fontWeight: 'normal', borderTop: 'none', borderLeft: 'none' }}>Causa</th>
                                <th style={{ ...styles.tableCell, width: '34%', fontWeight: 'normal', borderTop: 'none', borderLeft: 'none' }}>Solución</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ height: '96px' }}>
                                <td style={{ ...styles.tableCell, borderTop: 'none' }}></td>
                                <td style={{ ...styles.tableCell, borderTop: 'none', borderLeft: 'none' }}></td>
                                <td style={{ ...styles.tableCell, borderTop: 'none', borderLeft: 'none' }}></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* --- SECCIÓN 5: OBSERVACIONES --- */}
                <div className="mb-8">
                    <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '4px', color: '#000000' }}>Observaciones Generales :</div>
                    <div style={{ border: '1px solid #000000', height: '96px', padding: '8px', fontSize: '11px', color: '#000000' }}>
                        {data.observaciones}
                    </div>
                </div>

                {/* --- SECCIÓN 6: FIRMAS --- */}
                <div className="flex justify-between items-start mt-16 px-2">
                    {/* Firma Izquierda */}
                    <div className="w-[40%] flex flex-col items-center text-center">
                        <div style={{ width: '100%', borderTop: '1px solid #000000', marginBottom: '4px' }}></div>
                        <div style={{ fontWeight: 'bold', fontStyle: 'italic', fontSize: '11px', color: '#000000' }}>
                            Unidad Solicitante
                        </div>
                        <div style={{ fontSize: '10px', color: '#000000' }}>Firma y Sello</div>
                    </div>

                    {/* Firma Derecha */}
                    <div className="w-[45%] flex flex-col items-center text-center">
                        <div style={{ width: '100%', borderTop: '1px solid #000000', marginBottom: '4px' }}></div>
                        <div style={{ width: '100%', textAlign: 'center', fontSize: '10px', color: '#000000' }}>
                            <span style={{ fontWeight: 'bold' }}>Nombre:</span> Ing. Lilian Aracely Santos Aquino
                        </div>
                        <div style={{ width: '100%', fontWeight: 'bold', fontStyle: 'italic', fontSize: '11px', color: '#000000', marginTop: '2px' }}>
                            Técnico de Soporte UTI-INDES
                        </div>
                        <div style={{ width: '100%', fontSize: '10px', marginTop: '2px', color: '#000000' }}>
                            Firma y Sello
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

TechSupportReport.displayName = "TechSupportReport";
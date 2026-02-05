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

export const TechSupportReport = React.forwardRef<HTMLDivElement, { data: ReportData }>(
    ({ data }, ref) => {

        // Helper para campos subrayados
        const UnderlinedField = ({ label, value, className = "" }: { label: string, value: string, className?: string }) => (
            <div className={`flex items-end ${className}`}>
                <span className="text-[11px] mr-1 whitespace-nowrap font-medium text-black">{label}</span>
                <div className="flex-1 border-b border-black text-center text-[11px] px-2 leading-none pb-0.5 font-medium text-black">
                    {value}
                </div>
            </div>
        );

        return (
            <div
                ref={ref}
                className="w-[216mm] min-h-[279mm] p-[12mm] bg-white text-black font-sans mx-auto box-border"
                style={{ fontFamily: 'Arial, sans-serif' }}
            >
                {/* --- ENCABEZADO --- */}
                <div className="flex justify-between items-start mb-6 h-20">
                    <div className="w-24 h-20 flex items-center justify-start">
                        <img src="/logo-indes.png" alt="INDES" className="h-auto w-full object-contain" />
                    </div>

                    <div className="flex-1 px-4 text-center pt-2">
                        <h1 className="font-bold text-[14px] leading-tight text-[#002060]">
                            INSTITUTO NACIONAL DE LOS DEPORTES DE EL SALVADOR
                        </h1>
                        <h2 className="font-bold text-[11px] mt-1 text-black uppercase">
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
                            <span className="text-[11px] mr-1 font-medium">No Reporte:</span>
                            <div className="w-20 border-b border-black text-center text-[11px] leading-none pb-0.5">
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
                <div className="border border-black mb-4">
                    <div className="bg-[#d9d9d9] text-center font-bold text-[11px] py-1 border-b border-black text-black">
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
                <div className="border border-black mb-4">
                    <div className="bg-[#d9d9d9] text-center font-bold text-[11px] py-1 border-b border-black text-black">
                        Descripción del Equipo (Si Aplica)
                    </div>
                    <table className="w-full border-collapse text-[10px]">
                        <thead>
                            <tr className="text-center font-bold italic">
                                <th className="border-r border-black p-1 w-[20%] font-bold">Equipo</th>
                                <th className="border-r border-black p-1 w-[20%] font-bold">Marca</th>
                                <th className="border-r border-black p-1 w-[20%] font-bold">Modelo</th>
                                <th className="border-r border-black p-1 w-[20%] font-bold">Serie</th>
                                <th className="p-1 w-[20%] font-bold">Código Activo</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-t border-black h-[1px]"></tr>
                            <tr className="text-center h-6">
                                <td className="border-r border-black p-1 border-b border-black">{data.tipoEquipo}</td>
                                <td className="border-r border-black p-1 border-b border-black">{data.marca}</td>
                                <td className="border-r border-black p-1 border-b border-black">{data.modelo}</td>
                                <td className="border-r border-black p-1 border-b border-black">{data.serie}</td>
                                <td className="p-1 border-b border-black">{data.codigoActivo}</td>
                            </tr>
                            {[1, 2, 3, 4].map((i) => (
                                <tr key={i} className="h-6">
                                    <td className="border-r border-black border-b border-black"></td>
                                    <td className="border-r border-black border-b border-black"></td>
                                    <td className="border-r border-black border-b border-black"></td>
                                    <td className="border-r border-black border-b border-black"></td>
                                    <td className="border-b border-black"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* --- SECCIÓN 4: DIAGNÓSTICO --- */}
                <div className="border border-black mb-2">
                    <div className="bg-[#d9d9d9] text-center font-bold text-[11px] py-1 border-b border-black text-black">
                        Diagnostico :
                    </div>
                    <table className="w-full border-collapse text-[10px]">
                        <thead>
                            <tr className="text-center">
                                <th className="border-r border-black p-1 w-[33%] font-normal">Falla</th>
                                <th className="border-r border-black p-1 w-[33%] font-normal">Causa</th>
                                <th className="p-1 w-[34%] font-normal">Solución</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-t border-black h-24">
                                <td className="border-r border-black"></td>
                                <td className="border-r border-black"></td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* --- SECCIÓN 5: OBSERVACIONES --- */}
                <div className="mb-8">
                    <div className="font-bold text-[11px] mb-1">Observaciones Generales :</div>
                    <div className="border border-black h-24 p-2 text-[11px]">
                        {data.observaciones}
                    </div>
                </div>

                {/* --- SECCIÓN 6: FIRMAS --- */}
                {/* CORRECCIÓN AQUÍ: Usamos items-start en lugar de items-end */}
                <div className="flex justify-between items-start mt-16 px-2">

                    {/* Firma Izquierda */}
                    <div className="w-[40%] flex flex-col items-center text-center">
                        <div className="w-full border-t border-black mb-1"></div>
                        <div className="font-bold italic text-[11px] text-black">
                            Unidad Solicitante
                        </div>
                        <div className="text-[10px]">Firma y Sello</div>
                    </div>

                    {/* Firma Derecha */}
                    <div className="w-[45%] flex flex-col items-center text-center">
                        <div className="w-full border-t border-black mb-1"></div>
                        <div className="w-full text-center text-[10px]">
                            <span className="font-bold">Nombre:</span> Ing. Lilian Aracely Santos Aquino
                        </div>
                        <div className="w-full font-bold italic text-[11px] text-black mt-0.5">
                            Técnico de Soporte UTI-INDES
                        </div>
                        <div className="w-full text-[10px] mt-0.5">
                            Firma y Sello
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

TechSupportReport.displayName = "TechSupportReport";
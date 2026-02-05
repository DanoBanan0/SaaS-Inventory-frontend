"use client";

import { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, CalendarIcon, User, Laptop } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { TechSupportReport, ReportData } from "./TechSupportReport";

interface PrintReportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    device: any;
}

export function PrintReportDialog({ open, onOpenChange, device }: PrintReportDialogProps) {
    const componentRef = useRef<HTMLDivElement>(null);

    // --- ESTADOS ---

    const [useAssignedName, setUseAssignedName] = useState(true);
    const [signerName, setSignerName] = useState("");
    const [unidad, setUnidad] = useState("");
    const [correo, setCorreo] = useState("");
    const [telefono, setTelefono] = useState("");
    const [tipoEquipo, setTipoEquipo] = useState("Computadora");

    const [dateRecibido, setDateRecibido] = useState<Date | undefined>(new Date());
    const [dateEntrega, setDateEntrega] = useState<Date | undefined>(new Date());

    const [hRecibido, setHRecibido] = useState("08");
    const [mRecibido, setMRecibido] = useState("00");
    const [ampmRecibido, setAmpmRecibido] = useState("AM");

    const [hEntrega, setHEntrega] = useState("08");
    const [mEntrega, setMEntrega] = useState("00");
    const [ampmEntrega, setAmpmEntrega] = useState("AM");

    // --- INICIALIZACIÓN ---
    useEffect(() => {
        if (open && device) {
            const now = new Date();

            setDateRecibido(now);
            setDateEntrega(now);

            let h = now.getHours();
            const m = now.getMinutes().toString().padStart(2, '0');
            const ampm = h >= 12 ? 'PM' : 'AM';
            h = h % 12;
            h = h ? h : 12;

            setHRecibido(h.toString().padStart(2, '0'));
            setMRecibido(m);
            setAmpmRecibido(ampm);

            setHEntrega(h.toString().padStart(2, '0'));
            setMEntrega(m);
            setAmpmEntrega(ampm);

            if (device.employee) {
                setUseAssignedName(true);
                setSignerName(device.employee.name);
                
                // CAMBIO AQUÍ: Forzamos a que estos campos empiecen VACÍOS
                // para que tú los escribas manualmente.
                setUnidad(""); 
                setCorreo(""); 
                setTelefono(""); 
            } else {
                setUseAssignedName(false);
                setSignerName("");
                setUnidad("");
                setCorreo("");
                setTelefono("");
            }
        }
    }, [open, device]);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Acta_${device?.inventory_code || "Soporte"}`,
    });

    const getFormattedDate = (date: Date | undefined) => {
        return date ? format(date, "dd/MM/yyyy") : "";
    };

    const getFormattedTime = (h: string, m: string, ampm: string) => {
        return `${h}:${m} ${ampm}`;
    };

    // --- VALIDACIONES DE HORA ---
    const handleTimeChange = (val: string, setter: (v: string) => void, max: number) => {
        const numbers = val.replace(/\D/g, "");
        if (numbers === "") {
            setter("");
            return;
        }
        if (numbers.length > 2) return;
        const numValue = parseInt(numbers, 10);
        if (numValue > max) return; 

        setter(numbers);
    };

    const handleTimeBlur = (val: string, setter: (v: string) => void) => {
        if (val === "") {
            setter("00");
            return;
        }
        setter(val.padStart(2, '0'));
    };


    const reportData: ReportData = {
        fechaRecibido: getFormattedDate(dateRecibido),
        horaRecibido: getFormattedTime(hRecibido, mRecibido, ampmRecibido),
        fechaEntrega: getFormattedDate(dateEntrega),
        horaEntrega: getFormattedTime(hEntrega, mEntrega, ampmEntrega),
        noReporte: "",
        nombreUsuario: signerName,
        unidadUsuario: unidad,
        correoUsuario: correo,
        telefonoUsuario: telefono,
        tipoEquipo: tipoEquipo,
        marca: device?.brand || "-",
        modelo: device?.model || "-",
        serie: device?.serial_number || "-",
        codigoActivo: device?.inventory_code || "-",
        observaciones: device?.comments || ""
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!max-w-[95vw] !w-[95vw] h-[90vh] overflow-hidden flex flex-col p-0 sm:rounded-xl">

                <DialogHeader className="p-4 border-b bg-white z-10">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Printer className="w-6 h-6 text-blue-600" />
                        Configurar Acta de Entrega / Soporte
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-1 overflow-hidden bg-slate-100">

                    {/* COLUMNA IZQUIERDA: FORMULARIO */}
                    <div className="w-[30%] min-w-[380px] p-6 overflow-y-auto border-r bg-white h-full shadow-lg z-10">
                        <div className="space-y-8 pb-8">

                            {/* --- TIEMPOS --- */}
                            <fieldset className="border border-slate-200 p-5 rounded-lg bg-slate-50/50">
                                <legend className="text-sm font-bold text-slate-700 px-2 flex items-center mb-2">
                                    <CalendarIcon className="w-4 h-4 mr-2 text-blue-500" /> Tiempos
                                </legend>

                                <div className="space-y-5">
                                    {/* FILA 1: RECIBIDO */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="flex flex-col">
                                            <Label className="text-xs font-semibold text-slate-500 mb-2">Fecha Recibido</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full h-10 justify-start text-left font-normal bg-white border-slate-200 text-sm",
                                                            !dateRecibido && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {dateRecibido ? format(dateRecibido, "dd/MM/yyyy") : <span>DD/MM/AAAA</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={dateRecibido}
                                                        onSelect={setDateRecibido}
                                                        initialFocus
                                                        locale={es}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        <div>
                                            <Label className="text-xs font-semibold text-slate-500 mb-2 block">Hora Recibido</Label>
                                            <div className="flex gap-2 items-center">
                                                <Input 
                                                    className="bg-white h-10 w-12 text-center p-0 text-sm" 
                                                    value={hRecibido} 
                                                    onChange={e => handleTimeChange(e.target.value, setHRecibido, 12)} 
                                                    onBlur={(e) => handleTimeBlur(e.target.value, setHRecibido)}
                                                    maxLength={2} 
                                                />
                                                <span className="text-slate-400 font-bold">:</span>
                                                <Input 
                                                    className="bg-white h-10 w-12 text-center p-0 text-sm" 
                                                    value={mRecibido} 
                                                    onChange={e => handleTimeChange(e.target.value, setMRecibido, 59)} 
                                                    onBlur={(e) => handleTimeBlur(e.target.value, setMRecibido)}
                                                    maxLength={2} 
                                                />
                                                <Select value={ampmRecibido} onValueChange={setAmpmRecibido}>
                                                    <SelectTrigger className="h-10 w-[70px] bg-white text-sm px-2">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="AM">AM</SelectItem>
                                                        <SelectItem value="PM">PM</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* FILA 2: ENTREGA */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="flex flex-col">
                                            <Label className="text-xs font-semibold text-slate-500 mb-2">Fecha Entrega</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full h-10 justify-start text-left font-normal bg-white border-slate-200 text-sm",
                                                            !dateEntrega && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {dateEntrega ? format(dateEntrega, "dd/MM/yyyy") : <span>DD/MM/AAAA</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={dateEntrega}
                                                        onSelect={setDateEntrega}
                                                        initialFocus
                                                        locale={es}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        <div>
                                            <Label className="text-xs font-semibold text-slate-500 mb-2 block">Hora Entrega</Label>
                                            <div className="flex gap-2 items-center">
                                                <Input 
                                                    className="bg-white h-10 w-12 text-center p-0 text-sm" 
                                                    value={hEntrega} 
                                                    onChange={e => handleTimeChange(e.target.value, setHEntrega, 12)} 
                                                    onBlur={(e) => handleTimeBlur(e.target.value, setHEntrega)}
                                                    maxLength={2} 
                                                />
                                                <span className="text-slate-400 font-bold">:</span>
                                                <Input 
                                                    className="bg-white h-10 w-12 text-center p-0 text-sm" 
                                                    value={mEntrega} 
                                                    onChange={e => handleTimeChange(e.target.value, setMEntrega, 59)} 
                                                    onBlur={(e) => handleTimeBlur(e.target.value, setMEntrega)}
                                                    maxLength={2} 
                                                />
                                                <Select value={ampmEntrega} onValueChange={setAmpmEntrega}>
                                                    <SelectTrigger className="h-10 w-[70px] bg-white text-sm px-2">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="AM">AM</SelectItem>
                                                        <SelectItem value="PM">PM</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </fieldset>

                            {/* --- FIRMANTE --- */}
                            <fieldset className="border border-slate-200 p-5 rounded-lg bg-slate-50/50">
                                <legend className="text-sm font-bold text-slate-700 px-2 flex items-center mb-2">
                                    <User className="w-4 h-4 mr-2 text-blue-500" /> Datos del Firmante
                                </legend>
                                {device?.employee && (
                                    <div className="flex items-start space-x-3 bg-blue-50 p-3 border border-blue-100 rounded-md mb-4">
                                        <Checkbox
                                            id="useAssignee"
                                            checked={useAssignedName}
                                            onCheckedChange={(checked) => {
                                                setUseAssignedName(checked === true);
                                                if (checked === true) {
                                                    setSignerName(device.employee.name);
                                                    // NO rellenamos unidad automáticamente
                                                } else {
                                                    setSignerName("");
                                                }
                                            }}
                                        />
                                        <Label htmlFor="useAssignee" className="cursor-pointer text-sm font-medium text-blue-900 leading-tight pt-0.5">
                                            ¿Firma: <strong>{device.employee.name}</strong>?
                                        </Label>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-xs font-semibold text-slate-500 mb-2 block">Nombre Completo</Label>
                                        <Input value={signerName} onChange={e => { setSignerName(e.target.value); setUseAssignedName(false); }} className="bg-white h-10"/>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-xs font-semibold text-slate-500 mb-2 block">Unidad</Label>
                                            {/* TIENE VALUE PERO EMPIEZA VACÍO */}
                                            <Input value={unidad} onChange={e => setUnidad(e.target.value)} className="bg-white h-10" />
                                        </div>
                                        <div>
                                            <Label className="text-xs font-semibold text-slate-500 mb-2 block">Teléfono</Label>
                                            {/* TIENE VALUE PERO EMPIEZA VACÍO */}
                                            <Input value={telefono} onChange={e => setTelefono(e.target.value)} className="bg-white h-10" />
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-xs font-semibold text-slate-500 mb-2 block">Correo</Label>
                                        {/* TIENE VALUE PERO EMPIEZA VACÍO */}
                                        <Input value={correo} onChange={e => setCorreo(e.target.value)} className="bg-white h-10" />
                                    </div>
                                </div>
                            </fieldset>

                            {/* --- EQUIPO --- */}
                            <fieldset className="border border-slate-200 p-5 rounded-lg bg-slate-50/50">
                                <legend className="text-sm font-bold text-slate-700 px-2 flex items-center mb-2">
                                    <Laptop className="w-4 h-4 mr-2 text-blue-500" /> Equipo
                                </legend>
                                <div>
                                    <Label className="text-xs font-semibold text-slate-500 mb-2 block">Tipo de Equipo</Label>
                                    {/* TIENE VALUE PERO EMPIEZA VACÍO */}
                                    <Input value={tipoEquipo} onChange={e => setTipoEquipo(e.target.value)} className="bg-white h-10" />
                                </div>
                            </fieldset>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: VISTA PREVIA */}
                    <div className="flex-1 bg-slate-200 flex flex-col items-center justify-start p-8 overflow-hidden relative">
                        <div className="mb-4 text-slate-500 text-xs font-bold uppercase tracking-widest bg-white/50 px-3 py-1 rounded-full">
                            Vista Previa
                        </div>

                        <div className="flex-1 w-full flex items-start justify-center overflow-y-auto pb-20">
                            <div className="transform scale-[0.85] origin-top shadow-2xl border border-gray-300 bg-white">
                                <TechSupportReport ref={componentRef} data={reportData} />
                            </div>
                        </div>
                    </div>

                </div>

                <DialogFooter className="p-4 border-t bg-white z-20">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={() => handlePrint()} className="bg-blue-700 hover:bg-blue-800 gap-2 px-8 shadow-lg shadow-blue-900/20">
                        <Printer className="w-4 h-4" />
                        Imprimir
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
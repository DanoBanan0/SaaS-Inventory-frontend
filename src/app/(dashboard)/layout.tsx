"use client";

import Sidebar from "@/components/Sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, PanelLeftOpen } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">

            <div
                className={cn(
                    "hidden md:flex h-screen w-64 flex-col fixed inset-y-0 z-40 transition-transform duration-300 ease-in-out",
                    isDesktopSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <Sidebar onCollapse={() => setIsDesktopSidebarOpen(false)} />
            </div>


            <div className="md:hidden fixed top-0 w-full z-50 bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
                <Link href="/dashboard">
                    <span className="text-white font-bold text-lg">INDES<span className="text-blue-500">INVENTORY</span></span>
                </Link>

                <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                    <SheetTrigger asChild>
                        <button className="text-white p-1" suppressHydrationWarning>
                            <Menu className="w-6 h-6" />
                        </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 border-none w-64 bg-slate-900">
                        <Sidebar onNavigate={() => setIsMobileOpen(false)} />
                    </SheetContent>
                </Sheet>
            </div>

            <main
                className={cn(
                    "flex-1 w-full transition-all duration-300 ease-in-out relative",
                    "pt-20 md:pt-8",
                    isDesktopSidebarOpen ? "md:pl-64" : "md:pl-0"
                )}
            >
                {!isDesktopSidebarOpen && (
                    <Button
                        variant="outline"
                        onClick={() => setIsDesktopSidebarOpen(true)}
                        className="hidden md:flex fixed top-6 left-6 z-50 
                           h-12 w-12 rounded-full border-2 border-slate-200 bg-white 
                           text-slate-600 shadow-xl transition-all duration-300
                           hover:border-blue-500 hover:text-blue-600 hover:scale-110 hover:bg-white"
                        title="Mostrar menú"
                    >
                        <PanelLeftOpen className="h-6 w-6" strokeWidth={2.5} />
                    </Button>
                )}

                <div className="max-w-[1600px] mx-auto p-4 md:p-8 relative min-h-[calc(100vh-100px)]">
                    {/* Logo de fondo para todas las vistas */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                        {/* Logo oscuro para modo claro */}
                        <img
                            src="/INDES.png"
                            alt=""
                            className="w-[70%] max-w-[800px] opacity-[0.06] select-none dark:hidden"
                        />
                        {/* Logo blanco para modo oscuro */}
                        <img
                            src="/INDES-W.png"
                            alt=""
                            className="w-[70%] max-w-[800px] opacity-[0.08] select-none hidden dark:block"
                        />
                    </div>

                    {/* Contenido de la página */}
                    <div className="relative z-10">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
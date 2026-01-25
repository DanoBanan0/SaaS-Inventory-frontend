"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard, Package, ShoppingCart, Building2, Lock,
    Users, ShieldCheck, FileText, LogOut, UserCircle, PanelLeftClose
} from "lucide-react";
import { cn } from "@/lib/utils";
import Swal from "sweetalert2";
import api from "@/lib/axios"; // Importamos API para consultar rol fresco

interface SidebarProps {
    className?: string;
    onNavigate?: () => void;
    onCollapse?: () => void;
}

export default function Sidebar({ className, onNavigate, onCollapse }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    // Estado para el usuario y para la etiqueta del rol
    const [user, setUser] = useState<{ name: string; role_id: number; id: number } | null>(null);
    const [roleLabel, setRoleLabel] = useState("Cargando...");

    useEffect(() => {
        // 1. Carga inicial rápida desde localStorage
        const storedUser = localStorage.getItem("user");
        let initialUser = storedUser ? JSON.parse(storedUser) : null;

        if (initialUser) {
            setUser(initialUser);
            // Si ya teníamos el nombre del rol guardado, lo usamos de momento
            // @ts-ignore
            if (initialUser.role?.name) setRoleLabel(initialUser.role.name);
            else setRoleLabel(initialUser.role_id === 1 ? "Admin" : "Usuario");
        }

        // 2. Consultar a la API para obtener el ROL REAL actualizado
        const fetchFreshUser = async () => {
            if (!initialUser?.id) return;
            try {
                // Obtenemos la lista de usuarios (que incluye la relación role)
                const res = await api.get('/users');
                const usersList = res.data.data || res.data;

                // Buscamos mis datos
                const myData = usersList.find((u: any) => u.id === initialUser.id);

                if (myData) {
                    setUser(myData);
                    // Actualizamos localStorage para futuras cargas
                    localStorage.setItem("user", JSON.stringify(myData));

                    // Actualizamos la etiqueta con el nombre real del rol (Ej: "Developer")
                    setRoleLabel(myData.role?.name || "Sin Rol");
                }
            } catch (error) {
                console.error("Error actualizando perfil:", error);
            }
        };

        fetchFreshUser();
    }, []);

    const handleLogout = () => {
        Swal.fire({
            title: "¿Cerrar Sesión?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#1e40af",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Salir",
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                router.push("/login");
            }
        });
    };

    const menuItems = [
        {
            section: "Operativo", items: [
                { label: "Inicio", href: "/dashboard", icon: LayoutDashboard },
                { label: "Inventario", href: "/inventory", icon: Package },
                { label: "Compras", href: "/purchases", icon: ShoppingCart },
            ]
        },
        {
            section: "Organización", items: [
                { label: "Unidades", href: "/units", icon: Building2 },
                { label: "Empleados", href: "/employees", icon: Users },
            ]
        },
        {
            section: "Sistema", items: [
                { label: "Usuarios", href: "/users", icon: UserCircle },
                { label: "Roles", href: "/roles", icon: ShieldCheck }, // Icono actualizado
                { label: "Auditoría", href: "/audits", icon: FileText },
            ]
        },
    ];

    return (
        <aside className={cn("bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col h-full", className)}>

            {/* HEADER */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/50">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-white">
                        <span className="text-xl font-bold tracking-tight">INDES<span className="text-blue-500">INVENTORY</span></span>
                    </div>

                    {onCollapse && (
                        <button
                            onClick={onCollapse}
                            className="hidden md:flex text-slate-400 hover:text-white transition-colors"
                            title="Ocultar menú"
                        >
                            <PanelLeftClose className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* PERFIL DE USUARIO */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <div className="h-10 w-10 rounded-full bg-blue-900 flex items-center justify-center text-blue-200 font-bold border border-blue-700">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">{user?.name || "..."}</p>
                        {/* AQUI SE MUESTRA EL ROL REAL */}
                        <p className="text-xs text-blue-400 uppercase font-bold truncate tracking-wide">
                            {roleLabel}
                        </p>
                    </div>
                </div>
            </div>

            {/* NAVEGACIÓN */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
                {menuItems.map((section, idx) => (
                    <div key={idx}>
                        <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{section.section}</h3>
                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={onNavigate}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                                            isActive ? "bg-blue-700 text-white shadow-md" : "hover:bg-slate-800 hover:text-white"
                                        )}
                                    >
                                        <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400")} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* FOOTER */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/30">
                <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-400 hover:bg-red-950/30 transition-colors">
                    <LogOut className="w-5 h-5" /> Cerrar Sesión
                </button>
            </div>
        </aside>
    );
}
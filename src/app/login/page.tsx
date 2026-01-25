// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios"; // Nuestra conexión configurada
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Swal from "sweetalert2"; // Alertas bonitas
import { Mail, Lock, Loader2, ShieldCheck } from "lucide-react"; // Iconos Lucide

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Petición al Backend
            const response = await api.post("/auth/login", form);

            // 2. Guardar Token y Datos del Usuario
            const { access_token, user } = response.data;
            localStorage.setItem("token", access_token);
            localStorage.setItem("user", JSON.stringify(user));

            // 3. Éxito
            Swal.fire({
                icon: "success",
                title: "¡Bienvenido!",
                text: `Accediendo como ${user.name}...`,
                timer: 1500,
                showConfirmButton: false,
                background: "#f8fafc", // slate-50
                color: "#0f172a", // slate-900
            });

            // 4. Redirigir al Dashboard
            router.push("/dashboard");

        } catch (error: any) {
            console.error(error);
            const errorMsg = error.response?.data?.error || "Error al conectar con el servidor";

            Swal.fire({
                icon: "error",
                title: "Acceso Denegado",
                text: errorMsg,
                confirmButtonColor: "#1e40af", // blue-800
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 px-4">
            <Card className="w-full max-w-md shadow-2xl border-slate-200 dark:border-slate-800">
                <CardHeader className="space-y-1 text-center pb-8">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-blue-100 dark:bg-slate-800 rounded-full">
                            {/* Icono Principal (Logo Simulado) */}
                            <ShieldCheck className="w-10 h-10 text-blue-700 dark:text-blue-500" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                        Sistema de Inventario
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                        Ingrese sus credenciales gubernamentales
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-6">

                        {/* Input Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Institucional</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="admin@gob.sv"
                                    className="pl-9 bg-slate-50 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Input Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-9 bg-slate-50 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Botón de Acción */}
                        <Button
                            type="submit"
                            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-5 transition-all"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando...
                                </>
                            ) : (
                                "Iniciar Sesión"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
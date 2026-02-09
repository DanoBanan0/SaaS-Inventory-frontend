// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Swal from "sweetalert2";
import { Mail, Lock, Loader2 } from "lucide-react";

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
            const response = await api.post("/auth/login", form);
            const { access_token, user } = response.data;
            localStorage.setItem("token", access_token);
            localStorage.setItem("user", JSON.stringify(user));

            Swal.fire({
                icon: "success",
                title: "¡Bienvenido!",
                text: `Accediendo como ${user.name}...`,
                timer: 1500,
                showConfirmButton: false,
                background: "#0f172a",
                color: "#f8fafc",
            });

            router.push("/dashboard");

        } catch (error: any) {
            console.error(error);

            Swal.fire({
                icon: "error",
                title: "Acceso Denegado",
                text: "",
                confirmButtonColor: "#1e40af",
                background: "#0f172a",
                color: "#f8fafc",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        // Fondo siempre oscuro (sin clases dark:, forzado)
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <Card className="w-full max-w-md shadow-2xl bg-slate-900 border-slate-800">
                <CardHeader className="space-y-1 text-center pb-8">
                    <div className="flex justify-center mb-4">
                        {/* Logo de INDES */}
                        <img
                            src="/INDES-W.png"
                            alt="INDES Logo"
                            className="h-20 w-auto object-contain"
                        />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">
                        Sistema de Inventario
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-6">

                        {/* Input Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300">Correo</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="usuario@indes.sv"
                                    className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Input Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300">Contraseña</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
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
// src/hooks/useAuth.ts

import { useState, useEffect } from "react";
import api from "@/lib/axios";

export function useAuth() {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Intenta obtener el usuario logueado.
                // Si tu backend usa otra ruta (ej: '/auth/user'), cámbiala aquí.
                const res = await api.get("/user");
                setUser(res.data);
            } catch (error) {
                // Si falla (no logueado), dejamos user en null
                console.error("No se pudo obtener el usuario", error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    return { user, isLoading };
}
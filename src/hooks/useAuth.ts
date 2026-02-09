
import { useState, useEffect } from "react";
import { User } from "@/types";

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Leer usuario del localStorage (mismo método que el Sidebar)
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Error parsing user from localStorage", error);
                setUser(null);
            }
        }
        setIsLoading(false);
    }, []);

    return { user, isLoading };
}
// src/lib/permissions.ts

// Definimos quiénes son los jefes
const SUPER_ROLES = ['admin', 'administrador', 'developer'];

export const canManageSystem = (roleName: string | undefined | null) => {
    if (!roleName) return false;
    return SUPER_ROLES.includes(roleName.toLowerCase());
};
// Esta función devuelve TRUE si el rol es Admin o Developer.
// Devuelve FALSE para cualquier otro (ej: "Soporte", "Inventario", "Digitador").
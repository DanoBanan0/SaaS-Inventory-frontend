import { SUPER_ROLES } from './constants';

export const canManageSystem = (roleName: string | undefined | null) => {
    if (!roleName) return false;
    return SUPER_ROLES.includes(roleName.toLowerCase());
};
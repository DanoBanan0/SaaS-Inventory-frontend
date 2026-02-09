"use client";

import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface AuditEventBadgeProps {
    event: string;
}

export function AuditEventBadge({ event }: AuditEventBadgeProps) {
    if (event === 'created') {
        return (
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none px-2.5 py-0.5 text-[10px] font-medium">
                Creación
            </Badge>
        );
    }
    if (event === 'updated') {
        return (
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 shadow-none px-2.5 py-0.5 text-[10px] font-medium">
                Edición
            </Badge>
        );
    }
    return (
        <Badge className="bg-red-50 text-red-700 border-red-200 shadow-none px-2.5 py-0.5 text-[10px] font-medium">
            Eliminación
        </Badge>
    );
}

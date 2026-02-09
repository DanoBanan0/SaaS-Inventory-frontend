import { ReactNode } from "react";
import { Search, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataFiltersProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;
    searchColSpan?: string;
    hasActiveFilters: boolean;
    onClear: () => void;
    clearColSpan?: string;
    children?: ReactNode;
    className?: string;
}

export function DataFilters({
    searchValue,
    onSearchChange,
    searchPlaceholder = "Buscar...",
    searchColSpan = "md:col-span-4",
    hasActiveFilters,
    onClear,
    clearColSpan = "md:col-span-1",
    children,
    className,
}: DataFiltersProps) {
    return (
        <Card className={cn("bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700", className)}>
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">

                <div className={cn("col-span-1 space-y-1", searchColSpan)}>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1">Búsqueda</span>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                        <Input
                            placeholder={searchPlaceholder}
                            className="pl-8 bg-white dark:bg-slate-900 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-500"
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                </div>

                {children}

                <div className={cn("col-span-1 flex justify-center md:justify-start", clearColSpan)}>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 w-full md:w-auto px-2"
                            onClick={onClear}
                            title="Limpiar filtros"
                        >
                            <X className="h-4 w-4 mr-1" />
                            <span className="md:hidden lg:inline">Limpiar</span>
                        </Button>
                    )}
                </div>

            </CardContent>
        </Card>
    );
}

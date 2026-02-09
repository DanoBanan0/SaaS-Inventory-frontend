"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-slate-200 dark:bg-slate-700",
                className
            )}
            {...props}
        />
    );
}

// Skeleton para filas de tabla
function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
    return (
        <div className="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-800">
            {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1" />
            ))}
        </div>
    );
}

// Skeleton para tabla completa
function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
    return (
        <div className="space-y-0">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} className="h-3 flex-1" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <TableRowSkeleton key={i} columns={columns} />
            ))}
        </div>
    );
}

// Skeleton para cards
function CardSkeleton() {
    return (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
            </div>
        </div>
    );
}

// Skeleton para grid de cards
function CardGridSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: count }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    );
}

// Skeleton para página completa
function PageSkeleton() {
    return (
        <div className="space-y-6">
            {/* Title */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <Skeleton className="h-10 md:col-span-6" />
                <Skeleton className="h-10 md:col-span-3" />
                <Skeleton className="h-10 md:col-span-2" />
            </div>
            {/* Table */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <TableSkeleton rows={8} columns={5} />
            </div>
        </div>
    );
}

export {
    Skeleton,
    TableRowSkeleton,
    TableSkeleton,
    CardSkeleton,
    CardGridSkeleton,
    PageSkeleton
};

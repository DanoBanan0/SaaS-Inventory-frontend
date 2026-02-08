import { useState, useCallback } from "react";

interface PaginationState {
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
}

interface UsePaginationReturn {
    pagination: PaginationState;
    setPagination: (data: any) => void;
    handlePageChange: (newPage: number, fetchFn: (page: number) => void) => void;
    resetPagination: () => void;
}

const initialState: PaginationState = {
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0
};

export function usePagination(): UsePaginationReturn {
    const [pagination, setPaginationState] = useState<PaginationState>(initialState);

    const setPagination = useCallback((data: any) => {
        setPaginationState({
            current_page: data.current_page || 1,
            last_page: data.last_page || 1,
            total: data.total || 0,
            from: data.from || 0,
            to: data.to || 0
        });
    }, []);

    const handlePageChange = useCallback((newPage: number, fetchFn: (page: number) => void) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            fetchFn(newPage);
        }
    }, [pagination.last_page]);

    const resetPagination = useCallback(() => {
        setPaginationState(initialState);
    }, []);

    return {
        pagination,
        setPagination,
        handlePageChange,
        resetPagination
    };
}

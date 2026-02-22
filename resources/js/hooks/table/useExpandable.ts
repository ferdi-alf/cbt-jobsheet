import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { UseExpandableReturn, ApiResponse } from "@/types/table";

export const useExpandable = <T>(): UseExpandableReturn<T> => {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const toggleRow = useCallback((rowId: string) => {
        setExpandedRows((prev) => {
            const next = new Set(prev);
            if (next.has(rowId)) next.delete(rowId);
            else next.add(rowId);
            return next;
        });
    }, []);

    const fetchSubData = useCallback(async () => {
        throw new Error("Use useExpandableQuery instead");
    }, []);

    return {
        expandedRows,
        toggleRow,
        fetchSubData,
        subDataCache: new Map(),
        loadingStates: new Map(),
        errorStates: new Map(),
    };
};

export const useExpandableQuery = <T>(
    rowId: string,
    url: string,
    enabled: boolean,
) => {
    return useQuery<ApiResponse<T>, Error>(
        ["expandable-data", rowId, url],
        async () => {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch: ${response.status} ${response.statusText}`,
                );
            }

            const result = (await response.json()) as ApiResponse<T>;

            if (!result.success) {
                throw new Error(result.error || "Unknown error occurred");
            }

            return result;
        },
        {
            enabled,
            staleTime: 60_000,
            cacheTime: 10 * 60 * 1000,
            keepPreviousData: true,
        },
    );
};

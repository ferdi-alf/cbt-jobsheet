import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, UseTableDataReturn } from "@/types/table";

interface UseTableDataOptions {
    fetchUrl: string;
    page?: number;
    pageSize?: number;
    search?: string;
    enabled?: boolean;
}

function getErrorMessage(err: unknown): string | null {
    if (!err) return null;
    if (err instanceof Error) return err.message;
    return String(err);
}

export const useTableData = <T>({
    fetchUrl,
    page = 1,
    pageSize = 15,
    search = "",
    enabled = true,
}: UseTableDataOptions): UseTableDataReturn<T> => {
    const buildUrl = () => {
        const origin =
            typeof window !== "undefined"
                ? window.location.origin
                : "http://localhost";

        const url = new URL(fetchUrl, origin);
        url.searchParams.set("page", String(page));
        url.searchParams.set("limit", String(pageSize));
        if (search) url.searchParams.set("search", search);

        return url.toString();
    };

    const query = useQuery<ApiResponse<T[]>, Error>(
        ["table-data", fetchUrl, page, pageSize, search],
        async () => {
            const response = await fetch(buildUrl());

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch: ${response.status} ${response.statusText}`,
                );
            }

            const result = (await response.json()) as ApiResponse<T[]>;
            if (!result.success)
                throw new Error(result.error || "Unknown error occurred");

            return result;
        },
        {
            enabled,
            staleTime: 30_000,
            cacheTime: 5 * 60 * 1000,
            keepPreviousData: true,
        },
    );

    return {
        data: query.data?.data ?? [],
        isLoading: query.isLoading,
        error: getErrorMessage(query.error),
        meta: query.data?.meta,
        refetch: () => query.refetch(),
    };
};

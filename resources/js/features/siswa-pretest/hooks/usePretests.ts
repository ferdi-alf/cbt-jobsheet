import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPretests } from "../api/pretests.api";
import type { PretestListResponse } from "../types";

export function usePretests(search: string) {
    const query = useInfiniteQuery<PretestListResponse, Error>(
        ["siswa-pretests", search],
        ({ pageParam = 1 }) =>
            fetchPretests({
                page: Number(pageParam),
                limit: 8,
                search,
            }),
        {
            getNextPageParam: (lastPage) =>
                lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
            staleTime: 5_000,
            cacheTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
        },
    );

    const items = useMemo(
        () => query.data?.pages.flatMap((page) => page.items) ?? [],
        [query.data],
    );

    const stats = query.data?.pages?.[0]?.stats ?? {
        total: 0,
        waiting: 0,
        in_progress: 0,
        submitted: 0,
    };

    const meta = query.data?.pages?.[query.data.pages.length - 1]?.meta ?? null;

    return {
        ...query,
        items,
        stats,
        meta,
    };
}

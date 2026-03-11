import { useQuery } from "@tanstack/react-query";
import type { SiswaMateriListItem } from "../types";
import { getSiswaMateris } from "../api/siswaMateris.api";

export function useSiswaMateris(search: string) {
    return useQuery<SiswaMateriListItem[], Error>({
        queryKey: ["siswa-materis", search],
        queryFn: () => getSiswaMateris(search),
        staleTime: 60_000,
    });
}

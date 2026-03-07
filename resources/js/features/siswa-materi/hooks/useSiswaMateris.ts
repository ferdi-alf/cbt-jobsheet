import { useQuery } from "@tanstack/react-query";
import { fetchSiswaMateris } from "../api/materis.api";
import type { SiswaMateriItem } from "../types";

export function useSiswaMateris() {
    return useQuery<SiswaMateriItem[], Error>({
        queryKey: ["siswa-materis"],
        queryFn: fetchSiswaMateris,
        staleTime: 60_000,
    });
}

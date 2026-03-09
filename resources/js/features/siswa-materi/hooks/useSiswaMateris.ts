import { useQuery } from "@tanstack/react-query";

import type { SiswaMateriListItem } from "../types";
import { getSiswaMateris } from "../api/siswaMateris.api";

export function useSiswaMateris() {
    return useQuery<SiswaMateriListItem[], Error>({
        queryKey: ["siswa-materis"],
        queryFn: getSiswaMateris,
        staleTime: 60_000,
    });
}

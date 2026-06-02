import { useQuery } from "@tanstack/react-query";
import { listAllJurusans } from "../api/jurusan.api";

export function useJurusanList() {
    return useQuery({
        queryKey: ["jurusans-all"],
        queryFn: listAllJurusans,
        staleTime: 2 * 60_000,
        cacheTime: 5 * 60_000,
    });
}

import { useQuery } from "@tanstack/react-query";
import type { LookupItem } from "../types";

type ApiRes<T> = { success: boolean; data: T; error?: string };

async function fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url, { credentials: "include" });
    const json = (await res.json()) as ApiRes<T>;
    if (!res.ok || !json.success) throw new Error(json.error || "Failed");
    return json.data;
}

export function useMateriLookups(open: boolean) {
    const kelas = useQuery<LookupItem[], Error>(
        ["lookups-kelas"],
        () => fetchJson<LookupItem[]>("/api/lookups/kelas"),
        { enabled: open, staleTime: 5 * 60 * 1000 },
    );

    const mapels = useQuery<LookupItem[], Error>(
        ["lookups-mapels"],
        () => fetchJson<LookupItem[]>("/api/lookups/mapels"),
        { enabled: open, staleTime: 5 * 60 * 1000 },
    );

    return { kelas, mapels };
}

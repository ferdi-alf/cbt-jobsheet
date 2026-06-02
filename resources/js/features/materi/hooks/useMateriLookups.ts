import { useQuery } from "@tanstack/react-query";
import type { LookupKelasItem, LookupMapelItem } from "../types";

type ApiRes<T> = { success: boolean; data: T; error?: string };

async function fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url, { credentials: "include" });
    const json = (await res.json()) as ApiRes<T>;
    if (!res.ok || !json.success) throw new Error(json.error || "Failed");
    return json.data;
}

export function useMateriLookups(open: boolean) {
    const kelas = useQuery<LookupKelasItem[], Error>(
        ["lookups-kelas"],
        () => fetchJson<LookupKelasItem[]>("/api/lookups/kelas"),
        { enabled: open, staleTime: 5 * 60 * 1000 },
    );

    const mapels = useQuery<LookupMapelItem[], Error>(
        ["lookups-mapels"],
        () => fetchJson<LookupMapelItem[]>("/api/lookups/mapels"),
        { enabled: open, staleTime: 5 * 60 * 1000 },
    );

    return { kelas, mapels };
}

import { useQuery } from "@tanstack/react-query";

type Item = { id: number; name: string };
type ApiRes<T> = { success: boolean; data: T; error?: string };

async function fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url);
    const json = (await res.json()) as ApiRes<T>;
    if (!res.ok || !json.success) throw new Error(json.error || "Failed");
    return json.data;
}

export function useUserLookups(open: boolean) {
    const kelas = useQuery<Item[], Error>(
        ["lookups-kelas"],
        () => fetchJson<Item[]>("/api/lookups/kelas"),
        { enabled: open, staleTime: 5 * 60 * 1000 },
    );

    const mapels = useQuery<Item[], Error>(
        ["lookups-mapels"],
        () => fetchJson<Item[]>("/api/lookups/mapels"),
        { enabled: open, staleTime: 5 * 60 * 1000 },
    );

    return { kelas, mapels };
}

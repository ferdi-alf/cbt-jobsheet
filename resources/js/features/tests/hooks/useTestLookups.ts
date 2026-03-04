import { useQuery } from "@tanstack/react-query";
import { MateriLookup } from "../types";

type ApiRes<T> = { success: boolean; data: T; error?: string };

async function fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url, { credentials: "include" });
    const json = (await res.json()) as ApiRes<T>;
    if (!res.ok || !json.success) throw new Error(json.error || "Failed");
    return json.data;
}

export function useTestLookups(open: boolean) {
    const materis = useQuery<MateriLookup[], Error>(
        ["lookups-materis-for-tests"],
        () => fetchJson<MateriLookup[]>("/api/lookups/materis"),
        { enabled: open, staleTime: 5 * 60 * 1000 },
    );

    return { materis };
}

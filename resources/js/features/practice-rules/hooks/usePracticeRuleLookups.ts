import { useQuery } from "@tanstack/react-query";
import type { LookupMateriItem } from "../types";
import { listMateriLookups } from "../api/practiceRules.api";

export function usePracticeRuleLookups(open: boolean) {
    const materis = useQuery<LookupMateriItem[], Error>(
        ["lookups-materis"],
        () => listMateriLookups(),
        { enabled: open, staleTime: 5 * 60 * 1000 },
    );

    return { materis };
}

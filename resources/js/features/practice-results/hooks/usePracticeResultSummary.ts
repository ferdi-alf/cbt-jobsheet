import { useQuery } from "@tanstack/react-query";
import { getPracticeResultSummary } from "../api/practiceResults.api";
import type { PracticeResultSummary } from "../types";

export function usePracticeResultSummary() {
    return useQuery<PracticeResultSummary, Error>({
        queryKey: ["practice-results-summary"],
        queryFn: getPracticeResultSummary,
        staleTime: 30_000,
    });
}

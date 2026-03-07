import { useQuery } from "@tanstack/react-query";

import type { TestResultData } from "../types";
import { fetchTestResult } from "../api/testSession.api";

export function useTestResult(publicKey: string) {
    return useQuery<TestResultData, Error>({
        queryKey: ["test-result", publicKey],
        queryFn: () => fetchTestResult(publicKey),
        staleTime: 60_000,
    });
}

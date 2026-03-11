import { api } from "@/lib/http";
import type {
    GradePracticePayload,
    PracticeResultDetail,
    PracticeResultSummary,
} from "../types";

export async function getPracticeResultSummary() {
    return api.get<PracticeResultSummary>("/api/practice-results/summary");
}

export async function getPracticeResult(id: number) {
    return api.get<PracticeResultDetail>(`/api/practice-results/${id}`);
}

export async function gradePracticeResult(
    id: number,
    payload: GradePracticePayload,
) {
    return api.put<boolean>(`/api/practice-results/${id}/grade`, payload);
}

import { api } from "@/lib/http";
import type {
    PracticeRuleDetail,
    PracticeRuleEditDetail,
    LookupMateriItem,
    RuleStats,
} from "../types";

export type CreatePracticeRulePayload = {
    materi_id: number;
    title: string;
    deadline_at?: string | null;
    checklists: { title: string }[];
};

export type UpdatePracticeRulePayload = Partial<CreatePracticeRulePayload>;

export async function listMateriLookups() {
    return api.get<LookupMateriItem[]>("/api/lookups/materis");
}

export async function getPracticeRule(id: number) {
    return api.get<PracticeRuleDetail>(`/api/practice-rules/${id}`);
}

export async function getPracticeRuleForEdit(id: number) {
    return api.get<PracticeRuleEditDetail>(
        `/api/practice-rules/${id}?mode=edit`,
    );
}

export async function createPracticeRule(payload: CreatePracticeRulePayload) {
    return api.post<{ id: number }>("/api/practice-rules", payload);
}

export async function updatePracticeRule(
    id: number,
    payload: UpdatePracticeRulePayload,
) {
    return api.put<boolean>(`/api/practice-rules/${id}`, payload);
}

export async function deletePracticeRule(id: number) {
    return api.del<boolean>(`/api/practice-rules/${id}`);
}

export async function getRuleStats(id: number) {
    return api.get<RuleStats>(`/api/practice-rules/${id}/stats`);
}

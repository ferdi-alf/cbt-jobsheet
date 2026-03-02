import { api } from "@/lib/http";
import type {
    MateriDetail,
    PracticeChecklistRes,
    PracticeRuleRow,
    TestRow,
} from "../types";

export async function getMateri(id: number) {
    return api.get<MateriDetail>(`/api/materis/${id}`);
}

export async function getMateriTests(materiId: number) {
    return api.get<TestRow[]>(`/api/materis/${materiId}/tests`);
}

export async function getMateriPracticeChecklists(materiId: number) {
    return api.get<PracticeChecklistRes>(
        `/api/materis/${materiId}/practice-checklists`,
    );
}

export async function createMateri(form: FormData) {
    return api.postForm<{ id: number }>(`/api/materis`, form);
}

export async function updateMateri(id: number, form: FormData) {
    return api.putForm<boolean>(`/api/materis/${id}`, form);
}

export async function deleteMateri(id: number) {
    return api.del<boolean>(`/api/materis/${id}`);
}

export async function getMateriPracticeRule(materiId: number) {
    return api.get<PracticeRuleRow | null>(
        `/api/materis/${materiId}/practice-checklists`,
    );
}

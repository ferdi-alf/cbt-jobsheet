import { api } from "@/lib/http";
import type {
    MateriDetail,
    MateriLeaderboardRow,
    MateriPracticeResultRow,
    MateriTestResultRow,
    MateriTopStudentRow,
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

export async function getMateriTopStudents(materiId: number) {
    return api.get<MateriTopStudentRow[]>(`/api/materis/${materiId}/top-students`);
}

export async function getMateriPracticeResults(materiId: number) {
    return api.get<MateriPracticeResultRow[]>(
        `/api/materis/${materiId}/practice-results`,
    );
}

export async function getMateriPretestResults(materiId: number) {
    return api.get<MateriTestResultRow[]>(
        `/api/materis/${materiId}/pretest-results`,
    );
}

export async function getMateriPosttestResults(materiId: number) {
    return api.get<MateriTestResultRow[]>(
        `/api/materis/${materiId}/posttest-results`,
    );
}

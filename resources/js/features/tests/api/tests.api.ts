import { api } from "@/lib/http";
import type {
    TestDetailForEdit,
    TestOverview,
    TestQuestionRow,
    TestAttemptRow,
} from "../types";

export type CreateTestPayload = {
    materi_id: number;
    type: "pretest" | "posttest";
    title: string;
    duration_minutes: 30 | 60 | 90 | 120;
    start_at?: string | null;
    end_at?: string | null;
    is_score_visible: boolean;

    questions: Array<{
        question: string;
        option_a: string;
        option_b: string;
        option_c: string;
        option_d: string;
        option_e: string;
        correct_option: "a" | "b" | "c" | "d" | "e";
    }>;
};

export type UpdateTestPayload = Partial<
    Omit<CreateTestPayload, "questions">
> & {
    questions?: CreateTestPayload["questions"];
};

export async function getTest(id: number) {
    return api.get<TestDetailForEdit>(`/api/tests/${id}`);
}

export async function createTest(payload: CreateTestPayload) {
    return api.post<{ id: number }>(`/api/tests`, payload);
}

export async function updateTest(id: number, payload: UpdateTestPayload) {
    return api.put<boolean>(`/api/tests/${id}`, payload);
}

export async function deleteTest(id: number) {
    return api.del<boolean>(`/api/tests/${id}`);
}

export async function getTestOverview(id: number) {
    return api.get<TestOverview>(`/api/tests/${id}/overview`);
}

export async function getTestQuestions(id: number) {
    return api.get<TestQuestionRow[]>(`/api/tests/${id}/questions`);
}

export async function getTestAttempts(id: number) {
    return api.get<TestAttemptRow[]>(`/api/tests/${id}/attempts`);
}

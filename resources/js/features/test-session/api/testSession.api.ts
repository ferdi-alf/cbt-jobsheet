import { api } from "@/lib/http";
import type {
    StartTestResponse,
    TestOptionValue,
    TestResultData,
} from "../types";

export async function startOrResumeTest(publicKey: string) {
    return api.post<StartTestResponse>(`/api/tests/${publicKey}/start`, {});
}

export async function saveTestAnswer(
    publicKey: string,
    payload: { question_id: number; selected_option: TestOptionValue },
) {
    return api.post<{ answered_count: number }>(
        `/api/tests/${publicKey}/answers`,
        payload,
    );
}

export async function submitTest(
    publicKey: string,
    payload: {
        answers: Array<{
            question_id: number;
            selected_option: TestOptionValue | null;
        }>;
    },
) {
    return api.post<{ redirect_url: string }>(
        `/api/tests/${publicKey}/submit`,
        payload,
    );
}

export async function fetchTestResult(publicKey: string) {
    return api.get<TestResultData>(`/api/tests/${publicKey}/result`);
}

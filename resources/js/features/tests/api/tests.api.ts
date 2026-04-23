import type {
    TestDetailForEdit,
    TestOverview,
    TestQuestionRow,
    TestAttemptRow,
} from "../types";

function buildTestFormData(
    payload: Record<string, any>,
    questionFiles: Array<File | null>,
): FormData {
    const fd = new FormData();

    fd.append("materi_id", String(payload.materi_id));
    fd.append("type", payload.type);
    fd.append("title", payload.title);
    fd.append("duration_minutes", String(payload.duration_minutes));
    fd.append("is_score_visible", payload.is_score_visible ? "1" : "0");
    if (payload.start_at) fd.append("start_at", payload.start_at);
    if (payload.end_at) fd.append("end_at", payload.end_at);

    payload.questions.forEach((q: any, idx: number) => {
        fd.append(`questions[${idx}][question]`, q.question);
        fd.append(`questions[${idx}][option_a]`, q.option_a);
        fd.append(`questions[${idx}][option_b]`, q.option_b);
        fd.append(`questions[${idx}][option_c]`, q.option_c);
        fd.append(`questions[${idx}][option_d]`, q.option_d);
        fd.append(`questions[${idx}][option_e]`, q.option_e);
        fd.append(`questions[${idx}][correct_option]`, q.correct_option);

        // Existing image path (edit mode)
        if (q.image_path) {
            fd.append(`questions[${idx}][image_path]`, q.image_path);
        }

        // File baru
        const file = questionFiles[idx];
        if (file) {
            fd.append(`questions[${idx}][image]`, file);
        }
    });

    return fd;
}

async function postFormData<T>(url: string, fd: FormData): Promise<T> {
    const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
            "X-XSRF-TOKEN": decodeURIComponent(
                document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? "",
            ),
        },
        body: fd,
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
        const err: any = new Error(json.error ?? "Request failed");
        err.status = res.status;
        err.payload = json;
        throw err;
    }
    return json.data as T;
}

async function putFormData<T>(url: string, fd: FormData): Promise<T> {
    // Laravel tidak support PUT multipart, gunakan POST + _method
    fd.append("_method", "PUT");
    return postFormData<T>(url, fd);
}

export type QuestionPayload = {
    question: string;
    image_path?: string | null; // path lama (edit)
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    option_e: string;
    correct_option: "a" | "b" | "c" | "d" | "e";
};

export type CreateTestPayload = {
    materi_id: number;
    type: "pretest" | "posttest";
    title: string;
    duration_minutes: 30 | 60 | 90 | 120;
    start_at?: string | null;
    end_at?: string | null;
    is_score_visible: boolean;
    questions: QuestionPayload[];
    questionFiles: Array<File | null>;
};

export type UpdateTestPayload = Partial<
    Omit<CreateTestPayload, "questionFiles">
> & {
    questionFiles?: Array<File | null>;
};

export async function getTest(id: number) {
    const res = await fetch(`/api/tests/${id}`, { credentials: "include" });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error ?? "Failed");
    return json.data as TestDetailForEdit;
}

export async function createTest(payload: CreateTestPayload) {
    const fd = buildTestFormData(payload, payload.questionFiles);
    return postFormData<{ id: number }>("/api/tests", fd);
}

export async function updateTest(id: number, payload: UpdateTestPayload) {
    const fd = buildTestFormData(payload, payload.questionFiles ?? []);
    return putFormData<boolean>(`/api/tests/${id}`, fd);
}

export async function deleteTest(id: number) {
    const res = await fetch(`/api/tests/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
            "X-XSRF-TOKEN": decodeURIComponent(
                document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? "",
            ),
            "Content-Type": "application/json",
        },
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error ?? "Failed");
    return json.data as boolean;
}

export async function getTestOverview(id: number) {
    const res = await fetch(`/api/tests/${id}/overview`, {
        credentials: "include",
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error ?? "Failed");
    return json.data as TestOverview;
}

export async function getTestQuestions(id: number) {
    const res = await fetch(`/api/tests/${id}/questions`, {
        credentials: "include",
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error ?? "Failed");
    return json.data as TestQuestionRow[];
}

export async function getTestAttempts(id: number) {
    const res = await fetch(`/api/tests/${id}/attempts`, {
        credentials: "include",
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error ?? "Failed");
    return json.data as TestAttemptRow[];
}

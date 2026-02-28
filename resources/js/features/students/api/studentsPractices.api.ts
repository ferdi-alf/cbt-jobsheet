import { api } from "@/lib/http";

export type PracticeRow = {
    id: number;
    materi_title: string;
    status: string | null;
    is_late: boolean;
    submitted_at: string | null;
    total_score: number | null;
};

export type PracticeItemRow = {
    id: number;
    title: string;
    note: string | null;
    has_photo: boolean;
    photos: Array<{ id: number; url: string }>;
};

export async function getStudentPractices(
    studentId: number,
    params: { page: number; limit: number; search?: string },
) {
    const qs = new URLSearchParams();
    qs.set("page", String(params.page));
    qs.set("limit", String(params.limit));
    if (params.search) qs.set("search", params.search);
    return api.get<PracticeRow[]>(
        `/api/students/${studentId}/practices?${qs.toString()}`,
    );
}

export async function getPracticeItems(submissionId: number) {
    return api.get<PracticeItemRow[]>(
        `/api/practice-submissions/${submissionId}/items`,
    );
}

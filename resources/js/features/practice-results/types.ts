export type PracticeResultFilter = "pending" | "graded" | "all";

export type PracticeResultRow = {
    id: number;
    student_name: string;
    status: "submitted" | "graded";
    submitted_at: string | null;
    total_score: number | null;
    graded_at: string | null;
    graded_by?: string | null;
    feedback?: string | null;
    materi_title?: string | null;
};

export type PracticeResultSummary = {
    pending_count: number;
    graded_count: number;
    total_count: number;
};

export type PracticeResultDetail = {
    id: number;
    status: "submitted" | "graded";
    submitted_at: string | null;
    graded_at: string | null;
    total_score: number | null;
    score_alat_bahan?: number | null;
    score_sop_k3l?: number | null;
    score_praktik?: number | null;
    feedback?: string | null;
    apd_photos: Array<{
        id: number;
        view_url: string;
        uploaded_at?: string | null;
    }>;
    student: {
        id: number;
        full_name: string;
        email?: string | null;
    };
    materi: {
        id: number;
        title: string;
        elemen?: string | null;
        tujuan_pembelajaran?: string | null;
        k3_alat_bahan?: string | null;
    };
    grader?: { id: number; name: string } | null;
    practice: {
        title?: string | null;
        description?: string | null;
        deadline_at?: string | null;
        checklists: Array<{
            id: number;
            order: number;
            title: string;
            standar?: string | null;
            rule_keterangan?: string | null;
            note?: string | null;
            score?: number | null;
            hasil?: string | null;
            keterangan?: string | null;
            photos: Array<{
                id: number;
                view_url: string;
                uploaded_at?: string | null;
            }>;
        }>;
        tools: Array<{
            kind: "alat" | "bahan";
            label: string | null;
            value: string | null;
            is_extra: boolean;
            photos?: Array<{ id: number; view_url: string }>;
        }>;
    };
};

export type GradePracticePayload = {
    feedback?: string | null;
    score_alat_bahan: number;
    score_sop_k3l: number;
    score_praktik: number;
    notes?: Array<{
        checklist_id: number;
        score?: number | null;
        note?: string | null;
    }>;
};

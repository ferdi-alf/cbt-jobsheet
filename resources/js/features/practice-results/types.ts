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
    feedback?: string | null;
    student: {
        id: number;
        full_name: string;
        email?: string | null;
    };
    materi: {
        id: number;
        title: string;
    };
    grader?: {
        id: number;
        name: string;
    } | null;
    practice: {
        title?: string | null;
        description?: string | null;
        deadline_at?: string | null;
        checklists: Array<{
            id: number;
            order: number;
            title: string;
            note?: string | null;
            photos: Array<{
                id: number;
                view_url: string;
                uploaded_at?: string | null;
            }>;
        }>;
    };
};

export type GradePracticePayload = {
    total_score: number;
    feedback?: string | null;
    notes: Array<{
        checklist_id: number;
        note?: string | null;
    }>;
};

export type LookupItem = { id: number; name: string };

export type MateriRow = {
    id: number;
    title: string;

    mapel?: string | null;
    kelas?: string | null;
    mapel_id?: number | null;
    kelas_id?: number | null;
    export_results_zip_url?: string | null;
    praktik_text?: string | null;

    created_by?:
        | { id?: number; name?: string | null; email?: string | null }
        | string
        | null;

    created_at?: string;

    download_url?: string | null;
};

export type MateriDetail = {
    id: number;
    title: string;
    praktik_text?: string | null;

    kelas_id: number;
    mapel_id: number;
    kelas?: string | null;
    mapel?: string | null;

    created_by?: {
        id?: number;
        name?: string | null;
        email?: string | null;
    } | null;

    pdf?: { download_url?: string | null; url: string | null } | null;
    export_results_zip_url?: string | null;

    created_at?: string;
};

export type TestRow = {
    id: number;
    title: string;
    type: string;
    created_at?: string;
};

export type PracticeChecklistRes = {
    id: number;
    title?: string | null;
    items: { id: number; title: string }[];
} | null;

export type PracticeRuleRow = {
    id: number;
    title: string | null;
    deadline_at?: string | null;
    created_at?: string;
};

export type ChecklistRow = {
    id: number;
    title: string;
    order: number;
    created_at?: string;
};

export type MateriTestAttemptRow = {
    id: number;
    full_name: string;
    test_title: string;
    type: "pretest" | "posttest";
    duration_label: string;
    score: number | null;
    created_at: string | null;
    submitted_at: string | null;
    total_correct: number;
    total_wrong: number;
};

export type MateriTopStudentRow = {
    student_user_id: number;
    full_name: string;
    avg_score: number;
    pretest_count: number;
    posttest_count: number;
};

export type MateriLeaderboardRow = {
    student_id: number;
    name: string;
    avg_score: number;
};

export type MateriPracticeResultRow = {
    id: number;
    full_name: string;
    status: "draft" | "submitted" | "graded";
    total_score: number | null;
    graded_by_label: string | null;
    submitted_at: string | null;
    graded_at: string | null;
    feedback?: string | null;
};

export type MateriTestResultRow = {
    id: number;
    full_name: string;
    title: string;
    duration_seconds: number | null;
    score: number | null;
    created_at: string | null;
    submitted_at: string | null;
    correct: number;
    wrong: number;
};

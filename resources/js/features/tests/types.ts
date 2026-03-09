export type TestType = "pretest" | "posttest";

export type TestRow = {
    id: number;
    title: string;
    type: TestType;
    duration_minutes: number;
    is_score_visible: boolean;

    materi?: {
        id: number;
        title: string;
        kelas?: string | null;
        mapel?: string | null;
    } | null;

    created_by?: {
        id: number;
        name?: string | null;
        email?: string | null;
        role?: string | null;
        full_name?: string | null;
    } | null;

    created_at?: string | null;
    total_questions?: number;
    start_at?: string | null;
    end_at?: string | null;
};

export type TestQuestionRow = {
    id: number;
    order: number;
    question: string;
    options: { a: string; b: string; c: string; d: string; e: string };
    correct_option: "a" | "b" | "c" | "d" | "e";
    created_at?: string;
};

export type TestAttemptRow = {
    id: number;
    name: string;
    kelas?: string | null;
    started_at?: string | null;
    finished_at?: string | null;
    duration_seconds?: number;
    score: number;
    correct: number;
    wrong: number;
};

export type TestOverview = {
    id: number;
    title: string;
    type: TestType;
    duration_minutes: number;
    start_at?: string | null;
    end_at?: string | null;
    is_score_visible: boolean;

    materi?: {
        id: number;
        title: string;
        kelas?: string | null;
        mapel?: string | null;
    } | null;

    created_by?: {
        id: number;
        name?: string | null;
        email?: string | null;
        role?: string | null;
        full_name?: string | null;
    } | null;

    stats: {
        total_questions: number;
        total_attempts: number;
    };

    top5: Array<{ student_id: number; name: string; score: number }>;
    pie: Array<{ label: string; value: number }>;
};

export type TestDetailForEdit = {
    id: number;
    materi_id: number;
    type: TestType;
    title: string;
    duration_minutes: number;
    start_at?: string | null;
    end_at?: string | null;
    is_score_visible: boolean;

    questions: Array<{
        id?: number;
        order?: number;
        question: string;
        option_a: string;
        option_b: string;
        option_c: string;
        option_d: string;
        option_e: string;
        correct_option: "a" | "b" | "c" | "d" | "e";
    }>;

    materi_label?: {
        title: string;
        kelas?: string | null;
        mapel?: string | null;
    } | null;
};

export type MateriLookup = {
    id: number;
    title: string;
    kelas?: string | null;
    mapel?: string | null;
};

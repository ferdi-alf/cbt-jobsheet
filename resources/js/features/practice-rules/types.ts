export type CreatedBy = { id: number; name: string | null; email: string };

export type MateriLite = { id: number; title: string };

export type PracticeRuleRow = {
    id: number;
    title: string;
    deadline_at: string | null;
    created_at?: string;

    total_checklists: number;

    materi?: MateriLite | null;
    kelas?: string | null;
    mapel?: string | null;

    created_by?: CreatedBy | null;
};

export type PracticeRuleDetail = {
    id: number;
    title: string;
    deadline_at: string | null;
    created_at?: string;

    total_checklists: number;

    materi?: MateriLite | null;
    kelas?: string | null;
    mapel?: string | null;

    created_by?: CreatedBy | null;
};

export type PracticeRuleEditDetail = {
    id: number;
    materi_id: number;
    title: string;
    deadline_at: string | null;
    checklists: { id?: number; title: string; order?: number }[];
    materi_label?: { title?: string; kelas?: string; mapel?: string };
};

export type LookupMateriItem = {
    id: number;
    title: string;
    kelas?: string | null;
    mapel?: string | null;
};

export type RuleStats = {
    total_students: number;
    submitted: number;
    not_submitted: number;
    chart: { label: string; value: number }[];
    not_submitted_students: { id: number; name: string; nisn?: string }[];
};

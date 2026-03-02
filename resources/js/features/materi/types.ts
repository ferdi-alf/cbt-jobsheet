export type LookupItem = { id: number; name: string };

export type MateriRow = {
    id: number;
    title: string;

    mapel?: string | null;
    kelas?: string | null;
    mapel_id?: number | null;
    kelas_id?: number | null;

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

export type SiswaMateriItem = {
    id: number;
    title: string;
    kelas?: string | null;
    mapel?: string | null;
    created_at?: string | null;

    is_locked: boolean;
    lock_reason?: string | null;

    pretest?: {
        id: number;
        title: string;
        deadline_at?: string | null;
        status: "not_started" | "in_progress" | "finished";
        score?: number | null;
    } | null;

    pdf?: {
        download_url?: string | null;
    };
};

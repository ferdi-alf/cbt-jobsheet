export type SiswaMateriListItem = {
    id: number;
    title: string;
    kelas?: string | null;
    mapel?: string | null;
    praktik_text_preview?: string | null;
    practice_title?: string | null;
    practice_deadline_at?: string | null;
    can_open: boolean;
    availability_label: string;
    practice_status: "not_started" | "draft" | "submitted" | "graded";
    practice_score?: number | null;
    pretest?: {
        id: number;
        title: string;
        status: "missing" | "not_started" | "in_progress" | "submitted";
    } | null;
};

export type ApdPhoto = {
    id: number | string;
    view_url: string;
    uploaded_at?: string | null;
    isUploading?: boolean;
};

export type PracticePhoto = {
    isUploading: boolean;
    id: number | string;
    view_url: string;
    uploaded_at?: string | null;
};

export type PracticeChecklist = {
    id: number;
    order: number;
    title: string;
    standar?: string | null;
    rule_keterangan?: string | null;
    note?: string | null;
    hasil?: string | null;
    keterangan?: string | null;
    photos: PracticePhoto[];
};

export type SiswaMateriDetail = {
    id: number;
    title: string;
    kelas?: string | null;
    mapel?: string | null;
    elemen?: string | null;
    tujuan_pembelajaran?: string | null;
    praktik_text?: string | null;
    pdf: { view_url: string; download_url?: string | null };
    practice: {
        rule_id?: number | null;
        title?: string | null;
        description?: string | null;
        k3_alat_bahan?: string | null;
        deadline_at?: string | null;
        status: "not_started" | "draft" | "submitted" | "graded";
        is_late?: boolean;
        submitted_at?: string | null;
        graded_at?: string | null;
        total_score?: number | null;
        feedback?: string | null;
        apd_photos: ApdPhoto[]; // ← baru
        checklists: PracticeChecklist[];
    };
};

export type UploadedApdPhoto = {
    id: number;
    view_url: string;
    uploaded_at?: string | null;
};

export type UploadedPracticePhoto = {
    id: number;
    checklist_id: number;
    view_url: string;
    uploaded_at?: string | null;
};

export type PracticeSubmitResult = {
    status: "submitted";
    is_late: boolean;
    submitted_at?: string | null;
    empty_count: number;
};

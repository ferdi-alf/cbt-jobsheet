export type PretestStatus = "not_started" | "in_progress" | "submitted";
export type PretestAvailabilityStatus =
    | "upcoming"
    | "available"
    | "expired"
    | "in_progress"
    | "submitted";

export type PretestCardItem = {
    id: number;
    public_key: string;
    type: "pretest";
    title: string;
    duration_minutes: number;
    start_at: string | null;
    end_at: string | null;
    deadline_at: string | null;
    total_questions: number;
    is_score_visible: boolean;
    entry_url: string;
    result_url: string;
    availability_status: PretestAvailabilityStatus;
    can_start: boolean;
    materi: {
        id: number;
        title: string;
        kelas?: string | null;
        mapel?: string | null;
    } | null;
    attempt: {
        status: PretestStatus;
        score: number | null;
        started_at: string | null;
        finished_at: string | null;
    } | null;
};

export type PretestListStats = {
    total: number;
    waiting: number;
    in_progress: number;
    submitted: number;
};

export type PretestListMeta = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    search: string;
};

export type PretestListResponse = {
    items: PretestCardItem[];
    stats: PretestListStats;
    meta: PretestListMeta;
};

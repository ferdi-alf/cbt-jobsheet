export type PosttestStatus = "not_started" | "in_progress" | "submitted";

export type PosttestAvailabilityStatus =
    | "upcoming"
    | "available"
    | "expired"
    | "in_progress"
    | "submitted"
    | "locked_pretest";

export type PosttestCardItem = {
    id: number;
    public_key: string;
    type: "posttest";
    title: string;
    duration_minutes: number;
    start_at: string | null;
    end_at: string | null;
    deadline_at: string | null;
    total_questions: number;
    is_score_visible: boolean;
    entry_url: string;
    result_url: string;
    availability_status: PosttestAvailabilityStatus;
    can_start: boolean;
    materi: {
        id: number;
        title: string;
        kelas?: string | null;
        mapel?: string | null;
    } | null;
    attempt: {
        status: PosttestStatus;
        score: number | null;
        started_at: string | null;
        finished_at: string | null;
    } | null;
};

export type PosttestListStats = {
    total: number;
    waiting: number;
    in_progress: number;
    submitted: number;
};

export type PosttestListMeta = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    search: string;
};

export type PosttestListResponse = {
    items: PosttestCardItem[];
    stats: PosttestListStats;
    meta: PosttestListMeta;
};

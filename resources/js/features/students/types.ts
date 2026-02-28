export type StudentRow = {
    id: number;
    avatar_path: string | null;
    full_name: string;
    kelas: string | null;
    email: string;
    avg_posttest: number;
    created_at: string;
};

export type StudentDetail = {
    student: {
        id: number;
        avatar_path: string | null;
        full_name: string;
        username: string | null;
        email: string;
        kelas_id: number | null;
        kelas: string | null;
        nisn: string;
        gender: "laki-laki" | "perempuan";
        phone: string;
        created_at: string;
    };
    stats: {
        avg_pretest: number;
        avg_posttest: number;
    };
    chart: {
        last_posttests: Array<{
            score: number;
            finished_at: string | null;
            materi: string;
        }>;
    };
    tables: {
        attempts: Array<{
            id: number;
            type: "pretest" | "posttest";
            test_title: string;
            materi_title: string;
            score: number | null;
            status: string | null;
            started_at: string | null;
            finished_at: string | null;
            duration_seconds: number | null;
        }>;
    };
};

export type StudentUpdatePayload = {
    kelas_id: number;
    username: string;
    email: string;
    password?: string | null;
    full_name: string;
    nisn: string;
    gender: "laki-laki" | "perempuan";
    phone: string;
};

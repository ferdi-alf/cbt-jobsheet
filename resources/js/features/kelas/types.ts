export type KelasRow = {
    id: number;
    name: string;
    total_students: number;
    total_guru: number;
    created_at: string;
};

export type StudentRow = {
    id: number;
    email: string;
    username: string;
    full_name: string;
    nisn: string;
    gender: "laki-laki" | "perempuan";
    phone: string;
    created_at: string;
};

export type KelasOverview = {
    kelas: { id: number; name: string; created_at: string };
    stats: { total_students: number; total_guru: number };
    gender: { laki_laki: number; perempuan: number };
    top_posttest: Array<{ siswa_id: number; name: string; score: number }>;
    guru_list: Array<{
        id: number;
        full_name: string;
        nip: string;
        mapel: string | null;
    }>;
};

export type MaterialRow = {
    id: number;
    title: string;
    pdf_url: string | null;
    created_at: string;
    created_by: { id: number; name: string | null; email: string };
};

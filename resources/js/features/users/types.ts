export type UserRole = "admin" | "guru";

export type UserRow = {
    id: number;
    email: string;
    username: string | null;
    role: UserRole;
    avatar_path?: string | null;
    created_at?: string;

    guru?: {
        full_name?: string;
        nip?: string;
        gender?: "laki-laki" | "perempuan";
        phone?: string;
        kelas?: string | null;
        mapel?: string | null;
        kelas_id?: number | null;
        mapel_id?: number | null;
    } | null;
};

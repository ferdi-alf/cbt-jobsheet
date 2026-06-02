export type MapelFase = "E" | "F" | "E,F";

export type MapelRow = {
    id: number;
    name: string;
    fase: MapelFase | null;
    total_guru?: number;
    total_materi?: number;
    created_at?: string;
};

export type GuruRow = {
    id: number;
    email: string;
    username: string | null;
    full_name: string;
    nip?: string;
    gender?: string;
    phone?: string;
    kelas?: string | null;
    created_at?: string;
};

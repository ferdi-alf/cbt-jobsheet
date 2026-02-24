import type { UserRole, UserRow } from "../types";

export type Gender = "laki-laki" | "perempuan" | "";

export type FormState = {
    role: UserRole;
    email: string;
    username: string;
    password: string;

    full_name: string;
    nip: string;
    gender: Gender;
    phone: string;
    kelas_id: string;
    mapel_id: string;
};

export function mapInitialUserForm(initial?: UserRow): FormState {
    const g = initial?.guru?.gender;
    const gender: Gender = g === "laki-laki" || g === "perempuan" ? g : "";

    return {
        role: initial?.role ?? "admin",
        email: initial?.email ?? "",
        username: initial?.username ?? "",
        password: "",

        full_name: initial?.guru?.full_name ?? "",
        nip: initial?.guru?.nip ?? "",
        gender,
        phone: initial?.guru?.phone ?? "",
        kelas_id: initial?.guru?.kelas_id ? String(initial.guru.kelas_id) : "",
        mapel_id: initial?.guru?.mapel_id ? String(initial.guru.mapel_id) : "",
    };
}

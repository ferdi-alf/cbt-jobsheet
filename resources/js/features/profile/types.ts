export type UserRole = "admin" | "guru" | "siswa";

export type ProfileUser = {
    id: number;
    name: string;
    email: string;
    role: UserRole;
};

export type AdminProfile = {
    type: "admin";
};

export type GuruProfile = {
    type: "guru";
    full_name?: string | null;
    nip?: string | null;
    gender?: string | null;
    phone?: string | null;
    kelas_id?: number | null;
    kelas_name?: string | null;
    mapel_id?: number | null;
    mapel_name?: string | null;
};

export type SiswaProfile = {
    type: "siswa";
    full_name?: string | null;
    nisn?: string | null;
    gender?: string | null;
    phone?: string | null;
    kelas_id?: number | null;
    kelas_name?: string | null;
};

export type ProfileDetail = AdminProfile | GuruProfile | SiswaProfile;

export type ProfileResponse = {
    user: ProfileUser;
    profile: ProfileDetail;
};

export type UpdateAccountPayload = {
    name: string;
    email: string;
};

export type UpdatePasswordPayload = {
    current_password: string;
    password: string;
    password_confirmation: string;
};

export type UpdateGuruDetailPayload = {
    full_name: string;
    nip?: string | null;
    gender?: string | null;
    phone?: string | null;
    kelas_id?: number | null;
    mapel_id?: number | null;
};

export type UpdateSiswaDetailPayload = {
    full_name: string;
    phone?: string | null;
};

export type UpdateProfileDetailPayload =
    | UpdateGuruDetailPayload
    | UpdateSiswaDetailPayload;

export type AccountFormState = {
    name: string;
    email: string;
};

export type PasswordFormState = {
    current_password: string;
    password: string;
    password_confirmation: string;
};

export type GuruDetailFormState = {
    type: "guru";
    full_name: string;
    nip: string;
    gender: string;
    phone: string;
    kelas_id: string;
    kelas_name: string;
    mapel_id: string;
    mapel_name: string;
};

export type SiswaDetailFormState = {
    type: "siswa";
    full_name: string;
    nisn: string;
    gender: string;
    phone: string;
    kelas_id: string;
    kelas_name: string;
};

export type AdminDetailFormState = {
    type: "admin";
};

export type DetailFormState =
    | AdminDetailFormState
    | GuruDetailFormState
    | SiswaDetailFormState;

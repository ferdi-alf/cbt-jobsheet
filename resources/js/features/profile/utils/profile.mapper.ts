import type {
    AccountFormState,
    PasswordFormState,
    ProfileResponse,
    DetailFormState,
    UpdateProfileDetailPayload,
} from "../types";

export function mapAccountForm(
    data?: ProfileResponse | null,
): AccountFormState {
    return {
        name: data?.user?.name ?? "",
        email: data?.user?.email ?? "",
    };
}

export function mapPasswordForm(): PasswordFormState {
    return {
        current_password: "",
        password: "",
        password_confirmation: "",
    };
}

export function mapDetailForm(data?: ProfileResponse | null): DetailFormState {
    const profile = data?.profile;

    if (!profile) {
        return { type: "admin" };
    }

    if (profile.type === "guru") {
        return {
            type: "guru",
            full_name: profile.full_name ?? "",
            nip: profile.nip ?? "",
            gender: profile.gender ?? "",
            phone: profile.phone ?? "",
            kelas_id: profile.kelas_id ? String(profile.kelas_id) : "",
            kelas_name: profile.kelas_name ?? "",
            mapel_id: profile.mapel_id ? String(profile.mapel_id) : "",
            mapel_name: profile.mapel_name ?? "",
        };
    }

    if (profile.type === "siswa") {
        return {
            type: "siswa",
            full_name: profile.full_name ?? "",
            nisn: profile.nisn ?? "",
            gender: profile.gender ?? "",
            phone: profile.phone ?? "",
            kelas_id: profile.kelas_id ? String(profile.kelas_id) : "",
            kelas_name: profile.kelas_name ?? "",
        };
    }

    return { type: "admin" };
}

export function mapDetailPayload(
    form: DetailFormState,
): UpdateProfileDetailPayload | null {
    if (form.type === "guru") {
        return {
            full_name: form.full_name,
            nip: form.nip || null,
            gender: form.gender || null,
            phone: form.phone || null,
            kelas_id: form.kelas_id ? Number(form.kelas_id) : null,
            mapel_id: form.mapel_id ? Number(form.mapel_id) : null,
        };
    }

    if (form.type === "siswa") {
        return {
            full_name: form.full_name,
            phone: form.phone || null,
        };
    }

    return null;
}

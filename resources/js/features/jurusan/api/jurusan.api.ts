import { api } from "@/lib/http";
import { JurusanRow } from "../type";

export async function createJurusan(payload: {
    name: string;
    logo?: File | null;
}) {
    const form = new FormData();
    form.append("name", payload.name);
    if (payload.logo) form.append("logo", payload.logo);
    return api.postForm<JurusanRow>("/api/jurusans", form);
}

export async function updateJurusan(
    id: number,
    payload: { name: string; logo?: File | null },
) {
    const form = new FormData();
    form.append("name", payload.name);
    form.append("_method", "PUT");
    if (payload.logo) form.append("logo", payload.logo);
    return api.postForm<JurusanRow>(`/api/jurusans/${id}`, form);
}

export async function deleteJurusan(id: number) {
    return api.del<boolean>(`/api/jurusans/${id}`);
}

export async function listAllJurusans() {
    return api.get<JurusanRow[]>("/api/jurusans?page=1&limit=999");
}

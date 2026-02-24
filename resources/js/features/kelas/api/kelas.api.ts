import { api } from "@/lib/http";
import type {
    KelasRow,
    KelasOverview,
    StudentRow,
    MaterialRow,
} from "../types";

export async function listKelas(params: {
    page: number;
    limit: number;
    search?: string;
}) {
    const qs = new URLSearchParams();
    qs.set("page", String(params.page));
    qs.set("limit", String(params.limit));
    if (params.search) qs.set("search", params.search);
    return api.get<{ success: true }>(`/api/kelas?${qs.toString()}`);
}

export async function createKelas(payload: { name: string }) {
    return api.post<{ id: number }>("/api/kelas", payload);
}

export async function updateKelas(id: number, payload: { name: string }) {
    return api.put<boolean>(`/api/kelas/${id}`, payload);
}

export async function deleteKelas(id: number) {
    return api.del<boolean>(`/api/kelas/${id}`);
}

export async function getKelasOverview(id: number) {
    return api.get<KelasOverview>(`/api/kelas/${id}/overview`);
}

export async function getKelasStudents(id: number) {
    return api.get<StudentRow[]>(`/api/kelas/${id}/students`);
}

export async function getKelasMaterials(id: number) {
    return api.get<MaterialRow[]>(`/api/kelas/${id}/materials`);
}

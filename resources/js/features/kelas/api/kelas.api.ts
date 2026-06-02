import { api } from "@/lib/http";
import type {
    KelasRow,
    KelasOverview,
    StudentRow,
    MaterialRow,
} from "../types";

export type KelasPayload = {
    name: string;
    jurusan_id: number;
    tingkat: "X" | "XI" | "XII";
    tahun_ajaran: string;
};

export async function createKelas(payload: KelasPayload) {
    return api.post<{ id: number }>("/api/kelas", payload);
}

export async function updateKelas(id: number, payload: KelasPayload) {
    console.log("updateKelas called", id, JSON.stringify(payload));
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

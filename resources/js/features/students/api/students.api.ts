import { api } from "@/lib/http";
import type { StudentDetail, StudentRow, StudentUpdatePayload } from "../types";

export async function getStudentDetail(id: number) {
    return api.get<StudentDetail>(`/api/students/${id}`);
}

export async function updateStudent(id: number, payload: StudentUpdatePayload) {
    return api.put<boolean>(`/api/students/${id}`, payload);
}

export async function deleteStudent(id: number) {
    return api.del<boolean>(`/api/students/${id}`);
}

export async function listStudents(params: {
    page: number;
    limit: number;
    search?: string;
}) {
    const qs = new URLSearchParams();
    qs.set("page", String(params.page));
    qs.set("limit", String(params.limit));
    if (params.search) qs.set("search", params.search);
    return api.get<StudentRow[]>(`/api/students?${qs.toString()}`);
}

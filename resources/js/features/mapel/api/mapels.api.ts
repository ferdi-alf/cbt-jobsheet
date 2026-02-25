import { api } from "@/lib/http";
import type { MapelRow, GuruRow } from "../types";

export async function listMapels(params: {
    page: number;
    limit: number;
    search?: string;
}) {
    const qs = new URLSearchParams();
    qs.set("page", String(params.page));
    qs.set("limit", String(params.limit));
    if (params.search) qs.set("search", params.search);
    return api.get<MapelRow[]>(`/api/mapels?${qs.toString()}`);
}

export async function createMapel(payload: { name: string }) {
    return api.post<{ id: number }>("/api/mapels", payload);
}

export async function updateMapel(id: number, payload: { name: string }) {
    return api.put<boolean>(`/api/mapels/${id}`, payload);
}

export async function deleteMapel(id: number) {
    return api.del<boolean>(`/api/mapels/${id}`);
}

export async function getMapelGurus(
    id: number,
    params: { page: number; limit: number; search?: string },
) {
    const qs = new URLSearchParams();
    qs.set("page", String(params.page));
    qs.set("limit", String(params.limit));
    if (params.search) qs.set("search", params.search);
    return api.get<GuruRow[]>(`/api/mapels/${id}/gurus?${qs.toString()}`);
}

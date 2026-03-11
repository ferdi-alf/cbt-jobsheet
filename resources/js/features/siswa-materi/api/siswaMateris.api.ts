import { api } from "@/lib/http";
import type {
    PracticeSubmitResult,
    SiswaMateriDetail,
    SiswaMateriListItem,
    UploadedPracticePhoto,
} from "../types";

export async function getSiswaMateris(search = "") {
    const query = new URLSearchParams();

    const q = search.trim();
    if (q) query.set("search", q);

    const suffix = query.toString() ? `?${query.toString()}` : "";

    return api.get<SiswaMateriListItem[]>(`/api/siswa/materis${suffix}`);
}

export async function getSiswaMateri(id: number) {
    return api.get<SiswaMateriDetail>(`/api/siswa/materis/${id}`);
}

export async function uploadPracticePhoto(
    materiId: number,
    checklistId: number,
    file: File,
) {
    const fd = new FormData();
    fd.append("checklist_id", String(checklistId));
    fd.append("photo", file);

    return api.postForm<UploadedPracticePhoto>(
        `/api/siswa/materis/${materiId}/practice/photos`,
        fd,
    );
}

export async function deletePracticePhoto(photoId: number) {
    return api.del<boolean>(`/api/practice-photos/${photoId}`);
}

export async function submitPractice(
    materiId: number,
    confirmIncomplete = false,
) {
    return api.post<PracticeSubmitResult>(
        `/api/siswa/materis/${materiId}/practice/submit`,
        {
            confirm_incomplete: confirmIncomplete,
        },
    );
}

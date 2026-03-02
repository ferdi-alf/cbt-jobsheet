import type { MateriDetail } from "../types";

export type MateriFormState = {
    title: string;
    praktik_text: string;
    kelas_id: string;
    mapel_id: string;
    pdf: File | null;
};

export function mapInitialMateriForm(detail?: MateriDetail): MateriFormState {
    return {
        title: detail?.title ?? "",
        praktik_text: detail?.praktik_text ?? "",
        kelas_id: detail?.kelas_id ? String(detail.kelas_id) : "",
        mapel_id: detail?.mapel_id ? String(detail.mapel_id) : "",
        pdf: null,
    };
}

export function buildMateriFormData(state: MateriFormState) {
    const fd = new FormData();
    fd.append("title", state.title);
    fd.append("praktik_text", state.praktik_text || "");
    if (state.kelas_id) fd.append("kelas_id", state.kelas_id);
    if (state.mapel_id) fd.append("mapel_id", state.mapel_id);

    if (state.pdf) fd.append("pdf", state.pdf);
    return fd;
}

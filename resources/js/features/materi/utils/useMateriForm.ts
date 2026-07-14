import type { MateriDetail } from "../types";

/**
 * Teks default SOP / K3L / APD yang otomatis tertanam saat membuat materi baru.
 * Guru masih bisa mengedit / menambah sesuai kebutuhan praktek.
 */
export const DEFAULT_K3L_APD_TEXT = `Ikuti Aturan Sebelum melakukan PRAKTEK dibawah ini :
1. Gunakan Pakaian Praktek (Wearpack).
2. Gunakan Sarung Tangan Jika diperlukan.
3. Gunakan Alat dan Bahan Praktek sesuai fungsinya.
4. Pastikan Area Kerja Bersih dan Aman.
5. Matikan Mesin dan didinginkan sebelum pemeriksaan.`;

/** Tipe file materi yang diperbolehkan untuk diunggah. */
export const MATERI_ACCEPT_EXT = [
    "pdf",
    "doc",
    "docx",
    "ppt",
    "pptx",
    "png",
    "jpg",
    "jpeg",
];

export type MateriFormState = {
    title: string;
    praktik_text: string;
    k3_alat_bahan: string;
    elemen: string;
    tujuan_pembelajaran: string;
    kelas_id: string;
    mapel_id: string;
    pdf: File | null;
};

export function mapInitialMateriForm(detail?: MateriDetail): MateriFormState {
    return {
        title: detail?.title ?? "",
        praktik_text: detail?.praktik_text ?? "",
        // Materi baru (tanpa detail) diisi teks default; saat edit gunakan nilai tersimpan.
        k3_alat_bahan: detail
            ? (detail.k3_alat_bahan ?? "")
            : DEFAULT_K3L_APD_TEXT,
        elemen: detail?.elemen ?? "",
        tujuan_pembelajaran: detail?.tujuan_pembelajaran ?? "",
        kelas_id: detail?.kelas_id ? String(detail.kelas_id) : "",
        mapel_id: detail?.mapel_id ? String(detail.mapel_id) : "",
        pdf: null,
    };
}

export function buildMateriFormData(state: MateriFormState): FormData {
    const fd = new FormData();
    fd.append("title", state.title);
    fd.append("praktik_text", state.praktik_text || "");
    fd.append("k3_alat_bahan", state.k3_alat_bahan || "");
    fd.append("elemen", state.elemen || "");
    fd.append("tujuan_pembelajaran", state.tujuan_pembelajaran || "");
    if (state.kelas_id) fd.append("kelas_id", state.kelas_id);
    if (state.mapel_id) fd.append("mapel_id", state.mapel_id);
    if (state.pdf) fd.append("pdf", state.pdf);
    return fd;
}

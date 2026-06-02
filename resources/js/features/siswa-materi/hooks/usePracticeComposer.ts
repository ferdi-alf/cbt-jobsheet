import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
    deletePracticePhoto,
    deleteApdPhoto,
    submitPractice,
    updatePracticeItem,
    uploadApdPhoto,
    uploadPracticePhoto,
} from "../api/siswaMateris.api";
import type {
    ApdPhoto,
    PracticeChecklist,
    SiswaMateriDetail,
    UploadedPracticePhoto,
} from "../types";

type PersistedPhoto = PracticeChecklist["photos"][number];
type PendingPhoto = {
    id: string;
    view_url: string;
    uploaded_at?: string | null;
    isUploading: true;
};
type PersistedApdPhoto = ApdPhoto & { isUploading?: false };
type PendingApdPhoto = {
    id: string;
    view_url: string;
    uploaded_at?: null;
    isUploading: true;
};

type ChecklistWithPending = Omit<PracticeChecklist, "photos"> & {
    photos: Array<PersistedPhoto | PendingPhoto>;
};

type PracticeState = Omit<
    SiswaMateriDetail["practice"],
    "checklists" | "apd_photos"
> & {
    checklists: ChecklistWithPending[];
    apd_photos: Array<PersistedApdPhoto | PendingApdPhoto>;
};

function normalizeUploadedPhoto(saved: UploadedPracticePhoto): PersistedPhoto {
    return {
        id: saved.id,
        view_url: saved.view_url,
        uploaded_at: saved.uploaded_at ?? null,
        isUploading: false,
    };
}

export function usePracticeComposer({
    materiId,
    initial,
    onReload,
}: {
    materiId: number;
    initial: SiswaMateriDetail["practice"];
    onReload?: () => void;
}) {
    const [practice, setPractice] = useState<PracticeState>(
        initial as PracticeState,
    );
    const [submitting, setSubmitting] = useState(false);
    const saveTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(
        new Map(),
    );

    useEffect(() => {
        setPractice(initial as PracticeState);
    }, [initial]);

    const canEdit =
        practice.status === "not_started" || practice.status === "draft";
    const checklists = practice.checklists;
    const emptyCount = useMemo(
        () => checklists.filter((item) => item.photos.length === 0).length,
        [checklists],
    );

    const uploadFiles = async (checklistId: number, files: File[]) => {
        if (!canEdit || !files.length) return;
        for (const file of files) {
            const tempId =
                crypto.randomUUID?.() ?? `temp-${Date.now()}-${Math.random()}`;
            const previewUrl = URL.createObjectURL(file);
            setPractice((prev) => ({
                ...prev,
                status: prev.status === "not_started" ? "draft" : prev.status,
                checklists: prev.checklists.map((item) =>
                    item.id === checklistId
                        ? {
                              ...item,
                              photos: [
                                  ...item.photos,
                                  {
                                      id: tempId,
                                      view_url: previewUrl,
                                      uploaded_at: null,
                                      isUploading: true as const,
                                  },
                              ],
                          }
                        : item,
                ),
            }));
            try {
                const saved = await uploadPracticePhoto(
                    materiId,
                    checklistId,
                    file,
                );
                const normalized = normalizeUploadedPhoto(saved);
                setPractice((prev) => ({
                    ...prev,
                    checklists: prev.checklists.map((item) =>
                        item.id === checklistId
                            ? {
                                  ...item,
                                  photos: item.photos.map((p) =>
                                      String(p.id) === tempId ? normalized : p,
                                  ),
                              }
                            : item,
                    ),
                }));
            } catch (e: any) {
                setPractice((prev) => ({
                    ...prev,
                    checklists: prev.checklists.map((item) =>
                        item.id === checklistId
                            ? {
                                  ...item,
                                  photos: item.photos.filter(
                                      (p) => String(p.id) !== tempId,
                                  ),
                              }
                            : item,
                    ),
                }));
                toast.error(e?.message ?? "Gagal upload foto");
            } finally {
                URL.revokeObjectURL(previewUrl);
            }
        }
    };

    const removePhoto = async (
        checklistId: number,
        photoId: number | string,
    ) => {
        if (!canEdit) return;
        let removed: PersistedPhoto | PendingPhoto | null = null;
        let removedIdx = -1;
        setPractice((prev) => ({
            ...prev,
            checklists: prev.checklists.map((item) => {
                if (item.id !== checklistId) return item;
                const idx = item.photos.findIndex((p) => p.id === photoId);
                if (idx !== -1) {
                    removed = item.photos[idx];
                    removedIdx = idx;
                }
                return {
                    ...item,
                    photos: item.photos.filter((p) => p.id !== photoId),
                };
            }),
        }));
        if (!removed || typeof photoId === "string") return;
        try {
            await deletePracticePhoto(photoId as number);
        } catch (e: any) {
            setPractice((prev) => ({
                ...prev,
                checklists: prev.checklists.map((item) => {
                    if (item.id !== checklistId || !removed) return item;
                    const next = [...item.photos];
                    next.splice(
                        removedIdx >= 0 ? removedIdx : next.length,
                        0,
                        removed,
                    );
                    return { ...item, photos: next };
                }),
            }));
            toast.error(e?.message ?? "Gagal menghapus foto");
        }
    };

    const uploadApdFiles = async (files: File[]) => {
        if (!canEdit || !files.length) return;
        for (const file of files) {
            const tempId = crypto.randomUUID?.() ?? `temp-apd-${Date.now()}`;
            const previewUrl = URL.createObjectURL(file);
            setPractice((prev) => ({
                ...prev,
                status: prev.status === "not_started" ? "draft" : prev.status,
                apd_photos: [
                    ...prev.apd_photos,
                    {
                        id: tempId,
                        view_url: previewUrl,
                        uploaded_at: null,
                        isUploading: true as const,
                    },
                ],
            }));
            try {
                const saved = await uploadApdPhoto(materiId, file);
                setPractice((prev) => ({
                    ...prev,
                    apd_photos: prev.apd_photos.map((p) =>
                        String(p.id) === tempId
                            ? {
                                  id: saved.id,
                                  view_url: saved.view_url,
                                  uploaded_at: saved.uploaded_at ?? null,
                                  isUploading: false as const,
                              }
                            : p,
                    ),
                }));
            } catch (e: any) {
                setPractice((prev) => ({
                    ...prev,
                    apd_photos: prev.apd_photos.filter(
                        (p) => String(p.id) !== tempId,
                    ),
                }));
                toast.error(e?.message ?? "Gagal upload foto APD");
            } finally {
                URL.revokeObjectURL(previewUrl);
            }
        }
    };

    const removeApdPhoto = async (photoId: number | string) => {
        if (!canEdit) return;
        let removed: (PersistedApdPhoto | PendingApdPhoto) | null = null;
        let removedIdx = -1;
        setPractice((prev) => ({
            ...prev,
            apd_photos: prev.apd_photos.filter((p, idx) => {
                if (p.id === photoId) {
                    removed = p;
                    removedIdx = idx;
                    return false;
                }
                return true;
            }),
        }));
        if (!removed || typeof photoId === "string") return;
        try {
            await deleteApdPhoto(photoId as number);
        } catch (e: any) {
            setPractice((prev) => {
                const next = [...prev.apd_photos];
                if (removed)
                    next.splice(
                        removedIdx >= 0 ? removedIdx : next.length,
                        0,
                        removed,
                    );
                return { ...prev, apd_photos: next };
            });
            toast.error(e?.message ?? "Gagal menghapus foto APD");
        }
    };

    // ── Checklist text (hasil & keterangan) — save on blur ────────────────
    const updateChecklistText = useCallback(
        (checklistId: number, field: "hasil" | "keterangan", value: string) => {
            setPractice((prev) => ({
                ...prev,
                checklists: prev.checklists.map((c) =>
                    c.id === checklistId ? { ...c, [field]: value } : c,
                ),
            }));
        },
        [],
    );

    const saveChecklistItem = useCallback(
        async (checklistId: number) => {
            if (!canEdit) return;
            const checklist = practice.checklists.find(
                (c) => c.id === checklistId,
            );
            if (!checklist) return;
            try {
                await updatePracticeItem(materiId, checklistId, {
                    hasil: checklist.hasil?.trim() || null,
                    keterangan: checklist.keterangan?.trim() || null,
                });
            } catch (e: any) {
                toast.error(e?.message ?? "Gagal menyimpan");
            }
        },
        [practice.checklists, materiId, canEdit],
    );

    const submitAll = async (confirmIncomplete = false) => {
        setSubmitting(true);
        try {
            const res = await submitPractice(materiId, confirmIncomplete);
            setPractice((prev) => ({
                ...prev,
                status: res.status,
                is_late: res.is_late,
                submitted_at: res.submitted_at,
            }));
            toast.success("Praktek berhasil dikumpulkan");
            onReload?.();
            return res;
        } finally {
            setSubmitting(false);
        }
    };

    return {
        practice,
        checklists,
        canEdit,
        emptyCount,
        submitting,
        uploadFiles,
        removePhoto,
        uploadApdFiles,
        removeApdPhoto,
        updateChecklistText,
        saveChecklistItem,
        submitAll,
    };
}

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    deletePracticePhoto,
    submitPractice,
    uploadPracticePhoto,
} from "../api/siswaMateris.api";
import type {
    PracticeChecklist,
    SiswaMateriDetail,
    UploadedPracticePhoto,
} from "../types";

type PendingPhoto = {
    id: string;
    view_url: string;
    uploaded_at?: string | null;
    isUploading: true;
};

type ChecklistWithPending = Omit<PracticeChecklist, "photos"> & {
    photos: Array<PracticeChecklist["photos"][number] | PendingPhoto>;
};

type PracticeState = Omit<SiswaMateriDetail["practice"], "checklists"> & {
    checklists: ChecklistWithPending[];
};

function isPendingPhoto(
    photo: PracticeChecklist["photos"][number] | PendingPhoto,
): photo is PendingPhoto {
    return (photo as PendingPhoto).isUploading === true;
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
                typeof crypto !== "undefined" && "randomUUID" in crypto
                    ? crypto.randomUUID()
                    : `temp-${Date.now()}-${Math.random()}`;

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

                setPractice((prev) => ({
                    ...prev,
                    status:
                        prev.status === "not_started" ? "draft" : prev.status,
                    checklists: prev.checklists.map((item) =>
                        item.id === checklistId
                            ? {
                                  ...item,
                                  photos: item.photos.map((photo) =>
                                      String(photo.id) === tempId
                                          ? (saved as UploadedPracticePhoto)
                                          : photo,
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
                                      (photo) => String(photo.id) !== tempId,
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

        if (typeof photoId === "string") {
            setPractice((prev) => ({
                ...prev,
                checklists: prev.checklists.map((item) =>
                    item.id === checklistId
                        ? {
                              ...item,
                              photos: item.photos.filter(
                                  (photo) => String(photo.id) !== photoId,
                              ),
                          }
                        : item,
                ),
            }));
            return;
        }

        try {
            await deletePracticePhoto(photoId);
            setPractice((prev) => ({
                ...prev,
                checklists: prev.checklists.map((item) =>
                    item.id === checklistId
                        ? {
                              ...item,
                              photos: item.photos.filter(
                                  (photo) => photo.id !== photoId,
                              ),
                          }
                        : item,
                ),
            }));
            toast.success("Foto dihapus");
        } catch (e: any) {
            toast.error(e?.message ?? "Gagal menghapus foto");
        }
    };

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
        isPendingPhoto,
        uploadFiles,
        removePhoto,
        submitAll,
    };
}

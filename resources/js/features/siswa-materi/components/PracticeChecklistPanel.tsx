import PracticePhotoDropzone from "./PracticePhotoDropzone";
import type { PracticeChecklist } from "../types";
import PracticePhotoTile from "./PracticePhotoTile";

type PendingPhoto = {
    id: number | string;
    view_url: string;
    isUploading?: boolean;
};

export default function PracticeChecklistPanel({
    checklist,
    canEdit,
    onUpload,
    onDelete,
}: {
    checklist: PracticeChecklist & { photos: PendingPhoto[] };
    canEdit: boolean;
    onUpload: (checklistId: number, files: File[]) => void;
    onDelete: (checklistId: number, photoId: number | string) => void;
}) {
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
                {checklist.photos.map((photo) => (
                    <PracticePhotoTile
                        key={String(photo.id)}
                        photo={photo}
                        disabled={!canEdit || photo.isUploading === true}
                        onDelete={(photoId) => onDelete(checklist.id, photoId)}
                    />
                ))}

                {canEdit && (
                    <PracticePhotoDropzone
                        onSelect={(files) => onUpload(checklist.id, files)}
                    />
                )}
            </div>

            {checklist.note?.trim() && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                    <div className="font-medium">Catatan guru / admin</div>
                    <div className="mt-1 whitespace-pre-line">
                        {checklist.note}
                    </div>
                </div>
            )}
        </div>
    );
}

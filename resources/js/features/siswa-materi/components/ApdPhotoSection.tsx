import PracticePhotoDropzone from "./PracticePhotoDropzone";
import PracticePhotoTile from "./PracticePhotoTile";
import type { ApdPhoto } from "../types";

export default function ApdPhotoSection({
    k3Info,
    photos,
    canEdit,
    onUpload,
    onDelete,
}: {
    k3Info?: string | null;
    photos: ApdPhoto[];
    canEdit: boolean;
    onUpload: (files: File[]) => void;
    onDelete: (id: number | string) => void;
}) {
    return (
        <div className="rounded-3xl border bg-background p-4 shadow-sm space-y-3">
            <div>
                <div className="font-semibold">Bukti Pemakaian K3 / APD</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                    Upload foto bukti pemakaian APD sebelum mulai mengerjakan
                    checklist.
                </div>
            </div>

            {k3Info?.trim() && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-3 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200 whitespace-pre-line">
                    <div className="font-medium mb-1">
                        Prosedur K3 & APD yang Diperlukan
                    </div>
                    {k3Info}
                </div>
            )}

            <div className="flex flex-wrap gap-3">
                {photos.map((photo) => (
                    <PracticePhotoTile
                        key={String(photo.id)}
                        photo={photo}
                        disabled={!canEdit || photo.isUploading === true}
                        onDelete={onDelete}
                    />
                ))}
                {canEdit && <PracticePhotoDropzone onSelect={onUpload} />}
            </div>

            {!canEdit && photos.length === 0 && (
                <div className="text-sm text-muted-foreground">
                    Tidak ada foto APD yang diupload.
                </div>
            )}
        </div>
    );
}

import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import PracticePhotoDropzone from "./PracticePhotoDropzone";
import PracticePhotoTile from "./PracticePhotoTile";
import type { PracticeChecklist } from "../types";

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
    onTextChange,
    onTextBlur,
}: {
    checklist: PracticeChecklist & { photos: PendingPhoto[] };
    canEdit: boolean;
    onUpload: (checklistId: number, files: File[]) => void;
    onDelete: (checklistId: number, photoId: number | string) => void;
    onTextChange: (
        checklistId: number,
        field: "hasil" | "keterangan",
        value: string,
    ) => void;
    onTextBlur: (checklistId: number) => void;
}) {
    return (
        <div className="space-y-4 pb-2">
            {(checklist.standar?.trim() ||
                checklist.rule_keterangan?.trim()) && (
                <div className="rounded-xl border bg-muted/30 p-3 text-sm space-y-2">
                    {checklist.standar?.trim() && (
                        <div>
                            <span className="font-medium">Standar: </span>
                            <span className="text-muted-foreground">
                                {checklist.standar}
                            </span>
                        </div>
                    )}
                    {checklist.rule_keterangan?.trim() && (
                        <div>
                            <span className="font-medium">Keterangan: </span>
                            <span className="text-muted-foreground whitespace-pre-line">
                                {checklist.rule_keterangan}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Foto */}
            <div className="flex flex-wrap gap-3">
                {checklist.photos.map((photo) => (
                    <PracticePhotoTile
                        key={String(photo.id)}
                        photo={photo}
                        disabled={!canEdit || photo.isUploading === true}
                        onDelete={(id) => onDelete(checklist.id, id)}
                    />
                ))}
                {canEdit && (
                    <PracticePhotoDropzone
                        onSelect={(files) => onUpload(checklist.id, files)}
                    />
                )}
            </div>

            <div className="grid gap-3">
                {canEdit ? (
                    <>
                        <div className="grid gap-1.5">
                            <Label className="text-sm">
                                Hasil{" "}
                                <span className="font-normal text-muted-foreground"></span>
                            </Label>
                            <Input
                                value={checklist.hasil ?? ""}
                                onChange={(e) =>
                                    onTextChange(
                                        checklist.id,
                                        "hasil",
                                        e.target.value,
                                    )
                                }
                                onBlur={() => onTextBlur(checklist.id)}
                                placeholder="Deskripsikan hasil yang kamu capai..."
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label className="text-sm">
                                Keterangan{" "}
                                <span className="font-normal text-muted-foreground"></span>
                            </Label>
                            <Textarea
                                value={checklist.keterangan ?? ""}
                                onChange={(e) =>
                                    onTextChange(
                                        checklist.id,
                                        "keterangan",
                                        e.target.value,
                                    )
                                }
                                onBlur={() => onTextBlur(checklist.id)}
                                placeholder="Catatan tambahan untuk checklist ini..."
                                rows={2}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        {checklist.hasil?.trim() && (
                            <div className="rounded-xl border p-3 text-sm">
                                <div className="font-medium mb-1">Hasil</div>
                                <div className="text-muted-foreground">
                                    {checklist.hasil}
                                </div>
                            </div>
                        )}
                        {checklist.keterangan?.trim() && (
                            <div className="rounded-xl border p-3 text-sm">
                                <div className="font-medium mb-1">
                                    Keterangan
                                </div>
                                <div className="text-muted-foreground whitespace-pre-line">
                                    {checklist.keterangan}
                                </div>
                            </div>
                        )}
                    </>
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

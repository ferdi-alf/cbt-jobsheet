import type { ChangeEvent, DragEvent } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PracticePhotoDropzone({
    disabled,
    onSelect,
}: {
    disabled?: boolean;
    onSelect: (files: File[]) => void;
}) {
    const pick = (files: FileList | null) => {
        if (!files?.length || disabled) return;
        onSelect(Array.from(files));
    };

    const onDrop = (e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        pick(e.dataTransfer.files);
    };

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        pick(e.target.files);
        e.target.value = "";
    };

    return (
        <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className={cn(
                "flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed bg-background p-3 text-center transition",
                disabled
                    ? "cursor-not-allowed opacity-60"
                    : "hover:border-primary hover:bg-primary/5",
            )}
        >
            <UploadCloud className="h-5 w-5" />
            <div className="mt-2 text-xs font-medium">Tambah foto</div>
            <div className="mt-1 text-[11px] text-muted-foreground">
                Klik atau drag & drop
            </div>

            <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                multiple
                className="hidden"
                disabled={disabled}
                onChange={onChange}
            />
        </label>
    );
}

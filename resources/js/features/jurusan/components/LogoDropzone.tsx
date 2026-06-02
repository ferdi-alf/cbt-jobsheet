// features/jurusan/components/LogoDropzone.tsx

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/Components/ui/button";

interface LogoDropzoneProps {
    value: File | null;
    previewUrl?: string | null;
    onChange: (file: File | null) => void;
    error?: string;
}

export default function LogoDropzone({
    value,
    previewUrl,
    onChange,
    error,
}: LogoDropzoneProps) {
    const [localPreview, setLocalPreview] = useState<string | null>(null);

    const onDrop = useCallback(
        (accepted: File[]) => {
            const file = accepted[0];
            if (!file) return;
            if (localPreview) URL.revokeObjectURL(localPreview);
            const url = URL.createObjectURL(file);
            setLocalPreview(url);
            onChange(file);
        },
        [localPreview, onChange],
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] },
        maxFiles: 1,
        maxSize: 2 * 1024 * 1024,
        onDropRejected: (fileRejections: any) => {
            const err = fileRejections[0]?.errors[0];
            if (err?.code === "file-too-large")
                alert("File terlalu besar. Maksimal 2 MB.");
            else if (err?.code === "file-invalid-type")
                alert("Format tidak didukung. Gunakan JPG atau PNG.");
        },
    });

    const displayUrl = localPreview ?? previewUrl ?? null;
    const hasFile = !!value || !!previewUrl;

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (localPreview) {
            URL.revokeObjectURL(localPreview);
            setLocalPreview(null);
        }
        onChange(null);
    };

    return (
        <div className="space-y-1.5">
            <div
                {...getRootProps()}
                className={cn(
                    "relative flex flex-col items-center justify-center gap-2",
                    "border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                    "h-36 w-full text-sm",
                    isDragActive
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/30 hover:border-primary/60 hover:bg-muted/30",
                    error && "border-destructive",
                )}
            >
                <input {...getInputProps()} />

                {displayUrl ? (
                    <>
                        <img
                            src={displayUrl}
                            alt="Logo preview"
                            className="h-20 w-20 object-contain rounded"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive"
                            onClick={handleClear}
                        >
                            <X className="h-3.5 w-3.5" />
                        </Button>
                        <span className="text-xs text-muted-foreground">
                            {value?.name ?? "Logo tersimpan"} — klik / drag
                            untuk ganti
                        </span>
                    </>
                ) : (
                    <>
                        <ImagePlus className="h-8 w-8 text-muted-foreground/60" />
                        <span className="text-muted-foreground">
                            {isDragActive
                                ? "Lepaskan di sini..."
                                : "Drag & drop logo, atau klik untuk pilih"}
                        </span>
                        <span className="text-xs text-muted-foreground/60">
                            JPG / PNG · maks. 2 MB
                        </span>
                    </>
                )}
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

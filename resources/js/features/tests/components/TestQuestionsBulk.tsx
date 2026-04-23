import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import BulkGroups from "@/Components/bulk/BulkGroups";
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group";
import { ImagePlus, Upload, X } from "lucide-react";
import { useCallback } from "react";

type QuestionForm = {
    question: string;
    image_path?: string | null;
    image_file?: File | null;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    option_e: string;
    correct_option: "a" | "b" | "c" | "d" | "e";
};

function QuestionImageUpload({
    imageFile,
    imagePath,
    onFileChange,
    onRemove,
}: {
    imageFile?: File | null;
    imagePath?: string | null;
    onFileChange: (file: File) => void;
    onRemove: () => void;
}) {
    const previewUrl = imageFile
        ? URL.createObjectURL(imageFile)
        : (imagePath ? `/storage/${imagePath}` : null);

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file && file.type.startsWith("image/")) onFileChange(file);
        },
        [onFileChange],
    );

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onFileChange(file);
    };

    if (previewUrl) {
        return (
            <div className="relative w-full rounded-xl overflow-hidden border bg-muted/30">
                <div
                    className="relative w-full"
                    style={{ paddingBottom: "56.25%" /* 16:9 */ }}
                >
                    <img
                        src={previewUrl}
                        alt="Preview soal"
                        className="absolute inset-0 w-full h-full object-contain bg-white dark:bg-zinc-900"
                    />
                </div>
                <button
                    type="button"
                    onClick={onRemove}
                    className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-white shadow hover:bg-destructive/90 transition"
                    aria-label="Hapus gambar"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
                <label className="absolute bottom-2 right-2 z-10 flex cursor-pointer items-center gap-1.5 rounded-lg bg-background/90 px-2 py-1 text-xs font-medium shadow backdrop-blur-sm hover:bg-background transition">
                    <Upload className="h-3 w-3" />
                    Ganti
                    <input
                        type="file"
                        accept="image/jpg,image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        onChange={handleInput}
                    />
                </label>
            </div>
        );
    }

    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="group relative flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 py-8 text-center transition hover:border-primary/40 hover:bg-primary/5"
        >
            <ImagePlus className="h-8 w-8 text-muted-foreground/40 group-hover:text-primary/50 transition" />
            <div className="text-sm text-muted-foreground">
                Drag & drop gambar di sini, atau{" "}
                <label className="cursor-pointer text-primary underline underline-offset-2 hover:text-primary/80">
                    pilih file
                    <input
                        type="file"
                        accept="image/jpg,image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        onChange={handleInput}
                    />
                </label>
            </div>
            <p className="text-xs text-muted-foreground/60">
                JPG, PNG, WEBP, GIF — maks. 2 MB (opsional)
            </p>
        </div>
    );
}

export default function TestQuestionsBulk({ bulk }: { bulk: any }) {
    return (
        <BulkGroups<QuestionForm>
            title="Soal"
            addLabel="Tambah Soal"
            itemsLabelPrefix="Soal"
            bulk={bulk}
            renderItem={(q, idx, api) => {
                const err = (f: keyof QuestionForm) =>
                    api.getFieldError(idx, String(f));
                const keyOf = (field: keyof QuestionForm) =>
                    `questions.${idx}.${String(field)}`;

                return (
                    <div
                        className="space-y-3 text-start"
                        data-bulk-group-index={idx}
                    >
                        <div className="grid gap-2">
                            <Label>Pertanyaan</Label>
                            <Input
                                data-error-key={keyOf("question")}
                                className={
                                    err("question") ? "border-destructive" : ""
                                }
                                value={q.question}
                                onChange={(e) =>
                                    api.update(idx, {
                                        question: e.target.value,
                                    })
                                }
                                placeholder="Tulis pertanyaan..."
                            />
                            {err("question") && (
                                <div className="text-sm text-destructive">
                                    {err("question")}
                                </div>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label className="flex items-center gap-1.5">
                                <ImagePlus className="h-3.5 w-3.5 text-muted-foreground" />
                                Gambar Soal{" "}
                                <span className="text-xs font-normal text-muted-foreground">
                                    (opsional)
                                </span>
                            </Label>
                            <QuestionImageUpload
                                imageFile={q.image_file}
                                imagePath={q.image_path}
                                onFileChange={(file) =>
                                    api.update(idx, {
                                        image_file: file,
                                        image_path: null,
                                    })
                                }
                                onRemove={() =>
                                    api.update(idx, {
                                        image_file: null,
                                        image_path: null,
                                    })
                                }
                            />
                        </div>

                        {/* Pilihan jawaban */}
                        <div className="grid gap-2">
                            <Label>Jawaban (pilih yang benar)</Label>
                            <RadioGroup
                                value={q.correct_option}
                                onValueChange={(v: any) =>
                                    api.update(idx, { correct_option: v })
                                }
                                className="grid gap-2"
                                data-error-key={keyOf("correct_option")}
                            >
                                {(
                                    [
                                        ["a", "option_a"],
                                        ["b", "option_b"],
                                        ["c", "option_c"],
                                        ["d", "option_d"],
                                        ["e", "option_e"],
                                    ] as const
                                ).map(([opt, key]) => {
                                    const field = key as keyof QuestionForm;
                                    return (
                                        <div
                                            key={opt}
                                            className="flex items-center gap-3"
                                        >
                                            <RadioGroupItem
                                                value={opt}
                                                id={`q-${idx}-${opt}`}
                                            />
                                            <Input
                                                data-error-key={keyOf(field)}
                                                className={
                                                    err(field)
                                                        ? "border-destructive"
                                                        : ""
                                                }
                                                value={(q as any)[field] ?? ""}
                                                onChange={(e) =>
                                                    api.update(idx, {
                                                        [field]: e.target.value,
                                                    } as any)
                                                }
                                                placeholder="Tulis jawaban..."
                                            />
                                        </div>
                                    );
                                })}
                            </RadioGroup>

                            {(err("option_a") ||
                                err("option_b") ||
                                err("option_c") ||
                                err("option_d") ||
                                err("option_e")) && (
                                <div className="text-sm text-destructive">
                                    Semua pilihan jawaban wajib diisi.
                                </div>
                            )}
                            {err("correct_option") && (
                                <div className="text-sm text-destructive">
                                    {err("correct_option")}
                                </div>
                            )}
                        </div>
                    </div>
                );
            }}
        />
    );
}

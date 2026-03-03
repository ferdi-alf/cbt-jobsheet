import { useEffect, useMemo, useState } from "react";
import { usePage } from "@inertiajs/react";
import { toast } from "sonner";
import { UploadCloud, FileText, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
} from "@/Components/ui/dialog";
import { DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";

import { useMateriLookups } from "../hooks/useMateriLookups";
import { useMateriMutations } from "../hooks/useMateriMutations";
import { getMateri } from "../api/materi.api";
import {
    buildMateriFormData,
    mapInitialMateriForm,
    MateriFormState,
} from "../utils/useMateriForm";

export default function MateriFormDialog({
    mode,
    trigger,
    materiId,
    onSuccess,
}: {
    mode: "create" | "edit";
    trigger: React.ReactNode;
    materiId?: number;
    onSuccess?: () => void;
}) {
    const isEdit = mode === "edit";
    const [open, setOpen] = useState(false);
    const { props } = usePage<any>();
    const role = props.auth?.user?.role;
    const isAdmin = role === "admin";
    const isGuru = role === "guru";

    const { kelas, mapels } = useMateriLookups(open && isAdmin);

    const mutations = useMateriMutations(() => {
        setOpen(false);
        onSuccess?.();
    });

    const [loadingDetail, setLoadingDetail] = useState(false);
    const [form, setForm] = useState<MateriFormState>(() =>
        mapInitialMateriForm(),
    );

    useEffect(() => {
        if (!open) return;

        setForm(mapInitialMateriForm());

        if (isEdit && materiId) {
            setLoadingDetail(true);
            getMateri(materiId)
                .then((d) => setForm(mapInitialMateriForm(d)))
                .catch((e: any) =>
                    toast.error(e?.message ?? "Gagal memuat materi"),
                )
                .finally(() => setLoadingDetail(false));
        }
    }, [open, isEdit, materiId]);

    const set = (k: keyof MateriFormState, v: any) =>
        setForm((p) => ({ ...p, [k]: v }));

    const canSubmit = useMemo(() => {
        if (!form.title.trim()) return false;

        if (isAdmin) {
            if (!form.kelas_id) return false;
            if (!form.mapel_id) return false;
        }
        if (!isEdit && !form.pdf) return false;
        return true;
    }, [form, isEdit, isAdmin]);

    const onPickFile = (file: File | null) => {
        if (!file) return set("pdf", null);
        if (file.type !== "application/pdf") {
            toast.error("File harus PDF");
            return;
        }
        set("pdf", file);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const f = e.dataTransfer.files?.[0];
        if (f) onPickFile(f);
    };

    const submit = async () => {
        const fd = buildMateriFormData(form);

        if (!isEdit && !form.pdf) {
            toast.error("PDF wajib diupload");
            return;
        }

        if (isEdit) {
            await mutations.update(materiId!, fd);
        } else {
            await mutations.create(fd);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>

            <DialogContent
                aria-describedby={undefined}
                className="sm:max-w-[720px] w-11/12 h-[90%]"
            >
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Edit Materi" : "Upload Materi"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Perbarui judul, praktik, atau PDF materi."
                            : "Upload PDF materi dan isi detailnya."}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 overflow-auto">
                    <div className="grid gap-2">
                        <Label>Judul</Label>
                        <Input
                            value={form.title}
                            onChange={(e) => set("title", e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Deskripti Praktik</Label>
                        <Textarea
                            value={form.praktik_text}
                            onChange={(e) =>
                                set("praktik_text", e.target.value)
                            }
                            placeholder="Tulis instruksi praktik..."
                            rows={6}
                        />
                    </div>

                    {isAdmin && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Kelas</Label>
                                <Select
                                    value={form.kelas_id}
                                    onValueChange={(v) => set("kelas_id", v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={
                                                kelas.isLoading
                                                    ? "Loading..."
                                                    : "Pilih kelas"
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(kelas.data ?? []).map((k) => (
                                            <SelectItem
                                                key={k.id}
                                                value={String(k.id)}
                                            >
                                                {k.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Mapel</Label>
                                <Select
                                    value={form.mapel_id}
                                    onValueChange={(v) => set("mapel_id", v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={
                                                mapels.isLoading
                                                    ? "Loading..."
                                                    : "Pilih mapel"
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(mapels.data ?? []).map((m) => (
                                            <SelectItem
                                                key={m.id}
                                                value={String(m.id)}
                                            >
                                                {m.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {isGuru && (
                        <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                            Kelas & mapel untuk guru otomatis mengikuti profil
                            guru (dibatasi server).
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label>PDF</Label>

                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={onDrop}
                            className={cn(
                                "rounded-xl border bg-background p-4",
                                "flex flex-col items-center justify-center gap-2 text-center",
                                "border-dashed",
                            )}
                        >
                            <UploadCloud className="h-6 w-6" />
                            <div className="text-sm font-medium">
                                Drag & drop PDF di sini
                            </div>
                            <div className="text-xs text-muted-foreground">
                                atau pilih file dari perangkat
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                                <Input
                                    type="file"
                                    accept="application/pdf"
                                    className="max-w-xs"
                                    onChange={(e) =>
                                        onPickFile(e.target.files?.[0] ?? null)
                                    }
                                />
                            </div>

                            {form.pdf && (
                                <div className="mt-3 w-full rounded-lg border p-3 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <FileText className="h-4 w-4 text-red-600 shrink-0" />
                                        <div className="text-sm truncate">
                                            {form.pdf.name}
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => set("pdf", null)}
                                        aria-label="Remove file"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            {isEdit && !form.pdf && (
                                <div className="text-xs text-muted-foreground mt-2">
                                    (Edit) Kosongkan jika PDF tidak diganti.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Batal
                    </Button>
                    <Button
                        disabled={!canSubmit || loadingDetail}
                        onClick={submit}
                    >
                        {isEdit ? "Update" : "Upload"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

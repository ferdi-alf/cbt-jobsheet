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
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Badge } from "@/Components/ui/badge";
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
    MATERI_ACCEPT_EXT,
    type MateriFormState,
} from "../utils/useMateriForm";

const MATERI_ACCEPT_ATTR = MATERI_ACCEPT_EXT.map((e) => `.${e}`).join(",");
import type { LookupMapelItem } from "../types";

const TINGKAT_TO_FASE: Record<string, "E" | "F"> = {
    X: "E",
    XI: "F",
    XII: "F",
};

const FASE_LABEL: Record<string, string> = {
    E: "Fase E",
    F: "Fase F",
    "E,F": "Fase E & F",
};

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

    // Fase expected dari kelas yang dipilih
    const selectedKelas = useMemo(
        () => kelas.data?.find((k) => String(k.id) === form.kelas_id) ?? null,
        [kelas.data, form.kelas_id],
    );

    const expectedFase = selectedKelas?.tingkat
        ? (TINGKAT_TO_FASE[selectedKelas.tingkat] ?? null)
        : null;

    const filteredMapels = useMemo<LookupMapelItem[]>(() => {
        const all = mapels.data ?? [];
        if (!expectedFase) return all;
        return all.filter((m) => {
            if (!m.fase) return true;
            return m.fase.split(",").includes(expectedFase);
        });
    }, [mapels.data, expectedFase]);

    useEffect(() => {
        if (!form.mapel_id || !expectedFase) return;
        const stillValid = filteredMapels.some(
            (m) => String(m.id) === form.mapel_id,
        );
        if (!stillValid) set("mapel_id", "");
    }, [filteredMapels]);

    const canSubmit = useMemo(() => {
        if (!form.title.trim()) return false;
        if (isAdmin) {
            if (!form.kelas_id || !form.mapel_id) return false;
        }
        if (!isEdit && !form.pdf) return false;
        return true;
    }, [form, isEdit, isAdmin]);

    const onPickFile = (file: File | null) => {
        if (!file) return set("pdf", null);
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
        if (!MATERI_ACCEPT_EXT.includes(ext)) {
            toast.error("Format harus PDF, Word, PPT, PNG, atau JPG");
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
            toast.error("File materi wajib diupload");
            return;
        }
        if (isEdit) await mutations.update(materiId!, fd);
        else await mutations.create(fd);
    };

    const selectedMapel = mapels.data?.find(
        (m) => String(m.id) === form.mapel_id,
    );

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
                            ? "Perbarui detail materi."
                            : "Upload file materi (PDF/Word/PPT/Gambar) dan isi detailnya."}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 overflow-auto p-2">
                    {/* Judul */}
                    <div className="grid gap-2">
                        <Label>Judul</Label>
                        <Input
                            value={form.title}
                            onChange={(e) => set("title", e.target.value)}
                            placeholder="Judul materi..."
                        />
                    </div>

                    {/* Deskripsi Praktik */}
                    <div className="grid gap-2">
                        <Label>Deskripsi Praktik</Label>
                        <Textarea
                            value={form.praktik_text}
                            onChange={(e) =>
                                set("praktik_text", e.target.value)
                            }
                            placeholder="Tulis instruksi praktik..."
                            rows={4}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>K3 dan APD</Label>
                        <Textarea
                            value={form.k3_alat_bahan}
                            onChange={(e) =>
                                set("k3_alat_bahan", e.target.value)
                            }
                            placeholder="Tulis daftar prosedur keselamatan keamanan kerja (k3) dan APD"
                            rows={4}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Elemen</Label>
                        <Textarea
                            value={form.elemen}
                            onChange={(e) => set("elemen", e.target.value)}
                            placeholder="Contoh: Elemen 3.1 — Keamanan Jaringan..."
                            rows={4}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Tujuan Pembelajaran</Label>
                        <Textarea
                            value={form.tujuan_pembelajaran}
                            onChange={(e) =>
                                set("tujuan_pembelajaran", e.target.value)
                            }
                            placeholder="Contoh: Siswa mampu memahami konsep jaringan..."
                            rows={4}
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
                                                <span>{k.name}</span>
                                                {k.tingkat && (
                                                    <span className="ml-2 text-xs text-muted-foreground">
                                                        Kelas {k.tingkat}
                                                    </span>
                                                )}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Info fase dari kelas terpilih */}
                                {selectedKelas?.tingkat && (
                                    <p className="text-xs text-muted-foreground">
                                        Kelas {selectedKelas.tingkat} →{" "}
                                        <span className="font-medium text-foreground">
                                            {FASE_LABEL[expectedFase!] ??
                                                `Fase ${expectedFase}`}
                                        </span>{" "}
                                        — hanya mapel fase ini yang ditampilkan
                                    </p>
                                )}
                            </div>

                            {/* Mapel */}
                            <div className="grid gap-2">
                                <Label>Mapel</Label>
                                <Select
                                    value={form.mapel_id}
                                    onValueChange={(v) => set("mapel_id", v)}
                                    disabled={
                                        !form.kelas_id ||
                                        filteredMapels.length === 0
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={
                                                !form.kelas_id
                                                    ? "Pilih kelas dulu"
                                                    : mapels.isLoading
                                                      ? "Loading..."
                                                      : filteredMapels.length ===
                                                          0
                                                        ? "Tidak ada mapel untuk fase ini"
                                                        : "Pilih mapel"
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredMapels.map((m) => (
                                            <SelectItem
                                                key={m.id}
                                                value={String(m.id)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span>{m.name}</span>
                                                    {m.fase && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {FASE_LABEL[
                                                                m.fase
                                                            ] ?? m.fase}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Konfirmasi fase mapel terpilih */}
                                {selectedMapel?.fase && (
                                    <p className="text-xs text-muted-foreground">
                                        Mapel ini:{" "}
                                        <span className="font-medium text-foreground">
                                            {FASE_LABEL[selectedMapel.fase] ??
                                                selectedMapel.fase}
                                        </span>
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {isGuru && (
                        <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                            Kelas & mapel untuk guru otomatis mengikuti profil
                            guru (dibatasi server).
                        </div>
                    )}

                    {/* File Materi Upload */}
                    <div className="grid gap-2">
                        <Label>File Materi</Label>
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={onDrop}
                            className={cn(
                                "rounded-xl border bg-background p-4",
                                "flex flex-col items-center justify-center gap-2 text-center border-dashed",
                            )}
                        >
                            <UploadCloud className="h-6 w-6" />
                            <div className="text-sm font-medium">
                                Drag & drop file di sini
                            </div>
                            <div className="text-xs text-muted-foreground">
                                atau pilih file dari perangkat
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Format: PDF, Word, PPT, PNG, JPG (maks. 10MB)
                            </div>

                            <Input
                                type="file"
                                accept={MATERI_ACCEPT_ATTR}
                                className="max-w-xs mt-2"
                                onChange={(e) =>
                                    onPickFile(e.target.files?.[0] ?? null)
                                }
                            />

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
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            {isEdit && !form.pdf && (
                                <div className="text-xs text-muted-foreground mt-2">
                                    Kosongkan jika file tidak diganti.
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

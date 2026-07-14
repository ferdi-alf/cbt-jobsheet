import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Wrench, Package, Plus, X, Save, Camera } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import type { PracticeToolItem, PracticeToolPhoto } from "../types";
import {
    saveSiswaPracticeTools,
    uploadPracticeToolPhoto,
    deletePracticeToolPhoto,
} from "../api/siswaMateris.api";

type Row = {
    _uid: string;
    rule_tool_id: number | null;
    kind: "alat" | "bahan";
    label: string;
    value: string;
    is_extra: boolean;
    photos: PracticeToolPhoto[];
};

let uidCounter = 0;
const genUid = () => `row-${Date.now()}-${uidCounter++}`;

function toRows(initial: PracticeToolItem[]): Row[] {
    return initial.map((t) => ({
        _uid: genUid(),
        rule_tool_id: t.rule_tool_id,
        kind: t.kind,
        label: t.label ?? "",
        value: t.value ?? "",
        is_extra: t.is_extra,
        photos: t.photos ?? [],
    }));
}

export default function PracticeToolsSection({
    materiId,
    initial,
    canEdit,
}: {
    materiId: number;
    initial: PracticeToolItem[];
    canEdit: boolean;
}) {
    const [rows, setRows] = useState<Row[]>(() => toRows(initial));
    const [saving, setSaving] = useState(false);
    const savedRef = useRef(false);

    const alat = useMemo(() => rows.filter((r) => r.kind === "alat"), [rows]);
    const bahan = useMemo(() => rows.filter((r) => r.kind === "bahan"), [rows]);

    // Section hanya muncul jika guru mendefinisikan Alat/Bahan
    if (rows.length === 0 && initial.length === 0) return null;

    const setValue = (uid: string, value: string) =>
        setRows((prev) =>
            prev.map((r) => (r._uid === uid ? { ...r, value } : r)),
        );

    const setLabel = (uid: string, label: string) =>
        setRows((prev) =>
            prev.map((r) => (r._uid === uid ? { ...r, label } : r)),
        );

    const addRow = (kind: "alat" | "bahan") =>
        setRows((prev) => [
            ...prev,
            {
                _uid: genUid(),
                rule_tool_id: null,
                kind,
                label: "",
                value: "",
                is_extra: true,
                photos: [],
            },
        ]);

    const removeRow = (uid: string) =>
        setRows((prev) => prev.filter((r) => r._uid !== uid));

    const uploadPhoto = async (row: Row, file: File) => {
        if (!row.rule_tool_id) return;
        try {
            const res = await uploadPracticeToolPhoto(
                materiId,
                row.rule_tool_id,
                file,
            );
            setRows((prev) =>
                prev.map((r) =>
                    r._uid === row._uid
                        ? {
                              ...r,
                              photos: [
                                  ...r.photos,
                                  { id: res.id, view_url: res.view_url },
                              ],
                          }
                        : r,
                ),
            );
            toast.success("Foto terunggah");
        } catch (e: any) {
            toast.error(e?.message ?? "Gagal mengunggah foto");
        }
    };

    const deletePhoto = async (row: Row, photoId: number) => {
        try {
            await deletePracticeToolPhoto(photoId);
            setRows((prev) =>
                prev.map((r) =>
                    r._uid === row._uid
                        ? {
                              ...r,
                              photos: r.photos.filter((p) => p.id !== photoId),
                          }
                        : r,
                ),
            );
        } catch (e: any) {
            toast.error(e?.message ?? "Gagal menghapus foto");
        }
    };

    const save = async () => {
        setSaving(true);
        try {
            const payload = rows
                .filter((r) => !(r.is_extra && !r.label.trim() && !r.value.trim()))
                .map((r) => ({
                    rule_tool_id: r.rule_tool_id,
                    kind: r.kind,
                    label: r.is_extra ? r.label.trim() || null : null,
                    value: r.value.trim() || null,
                }));
            await saveSiswaPracticeTools(materiId, payload);
            savedRef.current = true;
            toast.success("Alat & Bahan tersimpan");
        } catch (e: any) {
            toast.error(e?.message ?? "Gagal menyimpan Alat & Bahan");
        } finally {
            setSaving(false);
        }
    };

    const renderGroup = (
        kind: "alat" | "bahan",
        groupRows: Row[],
        icon: React.ReactNode,
        title: string,
        valuePlaceholder: string,
    ) => {
        if (groupRows.length === 0 && !canEdit) return null;
        return (
            <div className="rounded-2xl border p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    {icon}
                    {title}
                </div>

                {groupRows.length === 0 ? (
                    <div className="text-xs italic text-muted-foreground">
                        Belum ada baris.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {groupRows.map((r) => (
                            <div
                                key={r._uid}
                                className="space-y-2 rounded-lg border p-2"
                            >
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                    {r.is_extra ? (
                                        <Input
                                            value={r.label}
                                            onChange={(e) =>
                                                setLabel(r._uid, e.target.value)
                                            }
                                            placeholder="Jenis (mis. Kunci pas)"
                                            disabled={!canEdit}
                                            className="sm:w-1/3"
                                        />
                                    ) : (
                                        <div className="text-sm font-medium sm:w-1/3">
                                            {r.label}
                                        </div>
                                    )}

                                    <Input
                                        value={r.value}
                                        onChange={(e) =>
                                            setValue(r._uid, e.target.value)
                                        }
                                        placeholder={valuePlaceholder}
                                        disabled={!canEdit}
                                        className="flex-1"
                                    />

                                    {canEdit && r.is_extra && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="shrink-0 text-destructive"
                                            onClick={() => removeRow(r._uid)}
                                            aria-label="Hapus baris"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                {!r.is_extra && r.rule_tool_id && (
                                    <div className="flex flex-wrap items-center gap-2">
                                        {r.photos.map((p) => (
                                            <div key={p.id} className="relative">
                                                <a
                                                    href={p.view_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <img
                                                        src={p.view_url}
                                                        alt="Foto"
                                                        className="h-12 w-12 rounded border object-cover"
                                                    />
                                                </a>
                                                {canEdit && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            deletePhoto(r, p.id)
                                                        }
                                                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white"
                                                        aria-label="Hapus foto"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {canEdit && (
                                            <label className="flex h-12 w-12 cursor-pointer flex-col items-center justify-center gap-0.5 rounded border border-dashed text-[10px] text-muted-foreground hover:bg-muted/50">
                                                <Camera className="h-4 w-4" />
                                                Foto
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const f =
                                                            e.target.files?.[0];
                                                        if (f) uploadPhoto(r, f);
                                                        e.target.value = "";
                                                    }}
                                                />
                                            </label>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {canEdit && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => addRow(kind)}
                    >
                        <Plus className="mr-1 h-4 w-4" />
                        Tambah {title}
                    </Button>
                )}
            </div>
        );
    };

    return (
        <div className="rounded-3xl border bg-background p-4 shadow-sm">
            <div className="mb-3">
                <div className="text-base font-semibold">Alat &amp; Bahan</div>
                <div className="text-sm text-muted-foreground">
                    Isi nama/spesifikasi Alat &amp; Bahan yang digunakan saat
                    praktek.
                </div>
            </div>

            <div className="space-y-3">
                {renderGroup(
                    "alat",
                    alat,
                    <Wrench className="h-4 w-4" />,
                    "Alat",
                    "Nama alat yang dipakai...",
                )}
                {renderGroup(
                    "bahan",
                    bahan,
                    <Package className="h-4 w-4" />,
                    "Bahan",
                    "Merk / spesifikasi / jumlah...",
                )}
            </div>

            {canEdit && (
                <div className="mt-3 flex justify-end">
                    <Button size="sm" onClick={save} disabled={saving}>
                        <Save className="mr-1.5 h-4 w-4" />
                        {saving ? "Menyimpan..." : "Simpan Alat & Bahan"}
                    </Button>
                </div>
            )}
        </div>
    );
}

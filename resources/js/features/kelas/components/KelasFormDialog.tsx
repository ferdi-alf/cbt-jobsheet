// features/kelas/components/KelasFormDialog.tsx

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useKelasMutations } from "../hooks/useKelasMutations";
import { useJurusanList } from "@/features/jurusan/hooks/useJurusanList";
import type { KelasRow } from "../types";

// ── Types ─────────────────────────────────────────────────────────────────────
interface KelasFormDialogProps {
    trigger: React.ReactNode;
    initial?: Pick<
        KelasRow,
        "id" | "name" | "tingkat" | "tahun_ajaran" | "jurusan"
    >;
}

type FormState = {
    name: string;
    tingkat: "X" | "XI" | "XII" | "";
    jurusan_id: string; // string agar kompatibel dengan Select value
    tahun_ajaran: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const TINGKAT_OPTIONS = ["X", "XI", "XII"] as const;

// ── Component ─────────────────────────────────────────────────────────────────
export default function KelasFormDialog({
    trigger,
    initial,
}: KelasFormDialogProps) {
    const isEdit = !!initial;

    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<FormState>(buildInitial(initial));
    const [errors, setErrors] = useState<FormErrors>({});

    const { create, update } = useKelasMutations(() => setOpen(false));
    const jurusanQ = useJurusanList();

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleOpenChange = (val: boolean) => {
        if (val) {
            setForm(buildInitial(initial));
            setErrors({});
        }
        setOpen(val);
    };

    const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
        setForm((prev) => ({ ...prev, [key]: val }));

    const validate = (): boolean => {
        const e: FormErrors = {};
        if (!form.name.trim()) e.name = "Nama kelas wajib diisi.";
        // cek eksplisit string kosong, bukan truthy — Number("") = 0 bisa bypass
        if (!form.jurusan_id || form.jurusan_id === "")
            e.jurusan_id = "Jurusan wajib dipilih.";
        if (!form.tingkat) e.tingkat = "Tingkat wajib dipilih.";
        if (!form.tahun_ajaran.trim()) {
            e.tahun_ajaran = "Tahun ajaran wajib diisi.";
        } else if (!/^\d{4}\/\d{4}$/.test(form.tahun_ajaran)) {
            e.tahun_ajaran = "Format: 2024/2025";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        const jurusanId = parseInt(form.jurusan_id, 10);
        // extra guard — seharusnya tidak terjadi jika validate() pass
        if (!jurusanId || jurusanId <= 0) return;

        const payload = {
            name: form.name.trim(),
            jurusan_id: jurusanId,
            tingkat: form.tingkat as "X" | "XI" | "XII",
            tahun_ajaran: form.tahun_ajaran.trim(),
        };

        if (isEdit) {
            await update(initial!.id, payload);
        } else {
            await create(payload);
        }
    };

    // ── Selected jurusan preview ───────────────────────────────────────────────
    const selectedJurusan = jurusanQ.data?.find(
        (j) => String(j.id) === form.jurusan_id,
    );

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Edit Kelas" : "Tambah Kelas"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Nama Kelas */}
                    <Field label="Nama Kelas" required error={errors.name}>
                        <Input
                            value={form.name}
                            onChange={(e) => set("name", e.target.value)}
                            placeholder="Contoh: XII TKJ 1"
                            className={errors.name ? "border-destructive" : ""}
                        />
                    </Field>

                    {/* Tingkat */}
                    <Field label="Tingkat" required error={errors.tingkat}>
                        <Select
                            value={form.tingkat}
                            onValueChange={(v) =>
                                set("tingkat", v as FormState["tingkat"])
                            }
                        >
                            <SelectTrigger
                                className={cn(
                                    errors.tingkat && "border-destructive",
                                )}
                            >
                                <SelectValue placeholder="Pilih tingkat..." />
                            </SelectTrigger>
                            <SelectContent>
                                {TINGKAT_OPTIONS.map((t) => (
                                    <SelectItem key={t} value={t}>
                                        Kelas {t}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>

                    {/* Jurusan */}
                    <Field label="Jurusan" required error={errors.jurusan_id}>
                        {jurusanQ.isLoading ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Memuat jurusan...
                            </div>
                        ) : jurusanQ.error ? (
                            <p className="text-sm text-destructive py-2">
                                Gagal memuat jurusan.
                            </p>
                        ) : (
                            <>
                                <Select
                                    value={form.jurusan_id}
                                    onValueChange={(v) => set("jurusan_id", v)}
                                >
                                    <SelectTrigger
                                        className={cn(
                                            errors.jurusan_id &&
                                                "border-destructive",
                                        )}
                                    >
                                        <SelectValue placeholder="Pilih jurusan..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(jurusanQ.data ?? []).map((j) => (
                                            <SelectItem
                                                key={j.id}
                                                value={String(j.id)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {j.logo_url ? (
                                                        <img
                                                            src={j.logo_url}
                                                            alt={j.name}
                                                            className="h-5 w-5 object-contain rounded-sm"
                                                        />
                                                    ) : (
                                                        <div className="h-5 w-5 rounded-sm bg-muted" />
                                                    )}
                                                    <span>{j.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Preview jurusan terpilih */}
                                {selectedJurusan && (
                                    <div className="flex items-center gap-3 rounded-md border bg-muted/40 px-3 py-2 mt-1.5">
                                        {selectedJurusan.logo_url ? (
                                            <img
                                                src={selectedJurusan.logo_url}
                                                alt={selectedJurusan.name}
                                                className="h-10 w-10 object-contain rounded"
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">
                                                N/A
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-medium">
                                                {selectedJurusan.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Jurusan terpilih
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </Field>

                    {/* Tahun Ajaran */}
                    <Field
                        label="Tahun Ajaran"
                        required
                        error={errors.tahun_ajaran}
                    >
                        <Input
                            value={form.tahun_ajaran}
                            onChange={(e) =>
                                set("tahun_ajaran", e.target.value)
                            }
                            placeholder="2024/2025"
                            maxLength={9}
                            className={
                                errors.tahun_ajaran ? "border-destructive" : ""
                            }
                        />
                    </Field>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => setOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button type="button" onClick={handleSubmit}>
                            {isEdit ? "Simpan Perubahan" : "Buat Kelas"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function Field({
    label,
    required,
    error,
    children,
}: {
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <Label>
                {label}{" "}
                {required && <span className="text-destructive">*</span>}
            </Label>
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

function buildInitial(initial?: KelasFormDialogProps["initial"]): FormState {
    return {
        name: initial?.name ?? "",
        tingkat: initial?.tingkat ?? "",
        jurusan_id: initial?.jurusan ? String(initial.jurusan.id) : "",
        tahun_ajaran: initial?.tahun_ajaran ?? "",
    };
}

import AdminLayout from "@/Layouts/AdminLayout";
import { Head } from "@inertiajs/react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { toast } from "sonner";
import { Download, Upload, Info } from "lucide-react";

import BulkGroups from "@/Components/bulk/BulkGroups";
import { useBulkGroups } from "@/hooks/bulk/useBulkGroups";
import BulkStudentFields from "@/features/students-bulk/components/BulkStudentFields";
import type { BulkStudentInput } from "@/features/students-bulk/types";
import { useStudentBulkMutations } from "@/features/students-bulk/hooks/useStudentBulkMutations";

const emptyStudent = (): BulkStudentInput => ({
    nisn: "",
    full_name: "",
    username: "",
    email: "",
    password: "",
    gender: "",
    phone: "",
});

async function fetchKelasLookups() {
    const res = await fetch("/api/lookups/kelas");
    const json = await res.json();
    if (!json?.success) throw new Error(json?.error ?? "Gagal load kelas");
    return json.data as Array<{ id: number; name: string }>;
}

const TEMPLATE_HEADERS = [
    "NISN *",
    "Nama Lengkap *",
    "Username",
    "Email",
    "Password",
    "Jenis Kelamin (laki-laki / perempuan)",
    "No. HP",
];

const TEMPLATE_NOTES = [
    "Wajib. Contoh: 0012345678",
    "Wajib. Sesuai dokumen resmi",
    "Opsional. Default: siswa_[nisn]",
    "Opsional. Default: [nisn]@student.local",
    "Opsional. Default: [nisn]",
    "Opsional. Default: laki-laki",
    "Opsional. Contoh: 08123456789",
];

const TEMPLATE_EXAMPLE = [
    "0012345678",
    "Budi Santoso",
    "budisantoso",
    "budi@example.com",
    "password123",
    "laki-laki",
    "081234567890",
];

function downloadTemplate() {
    const wb = XLSX.utils.book_new();

    const ws = XLSX.utils.aoa_to_sheet([
        TEMPLATE_HEADERS,
        TEMPLATE_NOTES,
        TEMPLATE_EXAMPLE,
    ]);

    // Column widths
    ws["!cols"] = [
        { wch: 16 },
        { wch: 28 },
        { wch: 20 },
        { wch: 28 },
        { wch: 18 },
        { wch: 36 },
        { wch: 18 },
    ];

    // Freeze top 2 rows
    ws["!freeze"] = { xSplit: 0, ySplit: 2 };

    XLSX.utils.book_append_sheet(wb, ws, "Siswa");
    XLSX.writeFile(wb, "template-import-siswa.xlsx");
}

function parseExcel(file: File): Promise<BulkStudentInput[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const wb = XLSX.read(data, { type: "array" });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json<any[]>(ws, {
                    header: 1,
                    defval: "",
                }) as any[][];

                const dataRows = rows
                    .slice(2)
                    .filter(
                        (row) =>
                            String(row[0] ?? "").trim() ||
                            String(row[1] ?? "").trim(),
                    );

                const students: BulkStudentInput[] = dataRows.map((row) => ({
                    nisn: String(row[0] ?? "").trim(),
                    full_name: String(row[1] ?? "").trim(),
                    username: String(row[2] ?? "").trim(),
                    email: String(row[3] ?? "").trim(),
                    password: String(row[4] ?? "").trim(),
                    gender:
                        (String(row[5] ?? "")
                            .trim()
                            .toLowerCase() as any) || "",
                    phone: String(row[6] ?? "").trim(),
                }));

                resolve(students.length ? students : [emptyStudent()]);
            } catch (err) {
                reject(
                    new Error(
                        "Gagal membaca file Excel. Pastikan format sesuai template.",
                    ),
                );
            }
        };
        reader.onerror = () => reject(new Error("Gagal membaca file."));
        reader.readAsArrayBuffer(file);
    });
}

export default function StudentsCreate() {
    const { submit } = useStudentBulkMutations();
    const importRef = useRef<HTMLInputElement>(null);

    const [kelasOptions, setKelasOptions] = useState<
        Array<{ id: number; name: string }>
    >([]);
    const [kelasId, setKelasId] = useState<string>("");
    const [importing, setImporting] = useState(false);

    const bulk = useBulkGroups<BulkStudentInput>({
        initialItem: emptyStudent,
        errorPrefix: "students",
    });

    useEffect(() => {
        fetchKelasLookups()
            .then(setKelasOptions)
            .catch((e) => toast.error(e.message));
    }, []);

    const canSubmit = useMemo(
        () =>
            !!kelasId &&
            bulk.items.some((s) => s.nisn.trim() && s.full_name.trim()),
        [kelasId, bulk.items],
    );

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        setImporting(true);
        try {
            const students = await parseExcel(file);
            bulk.setItems(students);
            bulk.clearErrors();
            toast.success(
                `${students.length} baris berhasil diimpor. Periksa data sebelum menyimpan.`,
            );
        } catch (err: any) {
            toast.error(err?.message ?? "Gagal mengimpor file.");
        } finally {
            setImporting(false);
        }
    };

    // ── Submit ──────────────────────────────────────────────────────────────
    const onSubmit = async () => {
        bulk.clearErrors();

        if (!kelasId) {
            toast.error("Pilih kelas terlebih dahulu sebelum menyimpan.");
            return;
        }

        // Client-side: hanya nisn & full_name wajib
        const errs: Record<string, string[]> = {};
        bulk.items.forEach((s, idx) => {
            if (!s.nisn.trim())
                errs[`students.${idx}.nisn`] = ["NISN wajib diisi."];
            if (!s.full_name.trim())
                errs[`students.${idx}.full_name`] = [
                    "Nama lengkap wajib diisi.",
                ];
        });
        if (Object.keys(errs).length) {
            bulk.setErrors(errs);
            bulk.scrollToFirstError();
            toast.error("Masih ada field wajib yang kosong.");
            return;
        }

        try {
            await submit({
                kelas_id: Number(kelasId),
                students: bulk.items.map((s) => ({
                    nisn: s.nisn.trim(),
                    full_name: s.full_name.trim(),
                    username: s.username?.trim() || undefined,
                    email: s.email?.trim() || undefined,
                    password: s.password?.trim() || undefined,
                    gender: s.gender || undefined,
                    phone: s.phone?.trim() || undefined,
                })),
            });

            setKelasId("");
            bulk.setItems([emptyStudent()]);
            bulk.clearErrors();
        } catch (e: any) {
            if (e?.status === 422 && e?.payload?.error === "VALIDATION_ERROR") {
                const serverErrs = (e?.payload?.errors ?? {}) as Record<
                    string,
                    string[]
                >;
                bulk.setErrors(serverErrs);
                bulk.scrollToFirstError(serverErrs);

                const firstKey = Object.keys(serverErrs)[0];
                const msg = serverErrs[firstKey]?.[0];
                toast.error(
                    msg ??
                        "Data tidak valid. Periksa kembali input yang ditandai merah.",
                );
                return;
            }
            toast.error(e?.message ?? "Gagal menambahkan siswa.");
        }
    };

    return (
        <AdminLayout>
            <Head title="Tambah Siswa" />

            <Card>
                <CardHeader>
                    <CardTitle>Tambah Siswa</CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Kelas selector + warning */}
                    <div className="space-y-2 max-w-sm fle">
                        <Label>
                            Kelas <span className="text-destructive">*</span>
                        </Label>
                        <Select value={kelasId} onValueChange={setKelasId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih kelas siswa..." />
                            </SelectTrigger>
                            <SelectContent>
                                {kelasOptions.map((k) => (
                                    <SelectItem key={k.id} value={String(k.id)}>
                                        {k.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            <span>
                                Pastikan kelas sudah dipilih sebelum menyimpan.
                                Semua siswa yang diinput akan dimasukkan ke
                                kelas ini.
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 items-start">
                        <div className="flex flex-wrap gap-1.5">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={downloadTemplate}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download Template Excel
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={importing}
                                onClick={() => importRef.current?.click()}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                {importing
                                    ? "Membaca file..."
                                    : "Import dari Excel"}
                            </Button>

                            <input
                                ref={importRef}
                                type="file"
                                accept=".xlsx,.xls"
                                className="hidden"
                                onChange={handleImportFile}
                            />
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Import akan menggantikan data yang sedang diinput.
                            Gunakan template untuk memastikan format kolom
                            benar.
                        </p>
                    </div>

                    {/* Bulk form */}
                    <BulkGroups
                        title="Data Siswa"
                        addLabel="Tambah Siswa"
                        itemsLabelPrefix="Siswa"
                        bulk={bulk}
                        renderItem={(item, idx, api) => (
                            <BulkStudentFields
                                item={item}
                                idx={idx}
                                bulk={{
                                    ...api,
                                    getFieldError: (i, f) =>
                                        api.getFieldError(i, f) ?? "",
                                }}
                            />
                        )}
                    />

                    <div className="flex justify-end">
                        <Button onClick={onSubmit} disabled={!canSubmit}>
                            Simpan Siswa
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </AdminLayout>
    );
}

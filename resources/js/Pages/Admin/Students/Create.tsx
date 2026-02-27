import AdminLayout from "@/Layouts/AdminLayout";
import { Head } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
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

import BulkGroups from "@/Components/bulk/BulkGroups";
import { useBulkGroups } from "@/hooks/bulk/useBulkGroups";
import BulkStudentFields from "@/features/students-bulk/components/BulkStudentFields";
import type { BulkStudentInput } from "@/features/students-bulk/types";
import { useStudentBulkMutations } from "@/features/students-bulk/hooks/useStudentBulkMutations";

const emptyStudent = (): BulkStudentInput => ({
    username: "",
    email: "",
    password: "",
    full_name: "",
    nisn: "",
    gender: "laki-laki",
    phone: "",
});

async function fetchKelasLookups() {
    const res = await fetch("/api/lookups/kelas");
    const json = await res.json();
    if (!json?.success) throw new Error(json?.error ?? "Gagal load kelas");
    return json.data as Array<{ id: number; name: string }>;
}

export default function StudentsCreate() {
    const { submit } = useStudentBulkMutations();

    const [kelasOptions, setKelasOptions] = useState<
        Array<{ id: number; name: string }>
    >([]);
    const [kelasId, setKelasId] = useState<string>("");

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
        () => !!kelasId && bulk.items.length > 0,
        [kelasId, bulk.items.length],
    );

    const clientValidate = () => {
        const errs: Record<string, string[]> = {};

        bulk.items.forEach((s, idx) => {
            const req = (field: keyof BulkStudentInput, msg: string) => {
                const val = String((s as any)[field] ?? "").trim();
                if (!val) errs[`students.${idx}.${field}`] = [msg];
            };

            req("username", "Username wajib diisi");
            req("email", "Email wajib diisi");
            req("password", "Password wajib diisi");
            req("full_name", "Nama lengkap wajib diisi");
            req("nisn", "NISN wajib diisi");
            req("gender", "Gender wajib diisi");
            req("phone", "Phone wajib diisi");
        });

        if (Object.keys(errs).length) {
            bulk.setErrors(errs);
            bulk.scrollToFirstError();
            toast.error("Masih ada field yang kosong");
            return false;
        }

        return true;
    };

    const onSubmit = async () => {
        bulk.clearErrors();

        if (!kelasId) {
            toast.error("Pilih kelas dulu");
            return;
        }

        if (!clientValidate()) return;

        try {
            await submit({
                kelas_id: Number(kelasId),
                students: bulk.items.map((s) => ({
                    ...s,
                    username: s.username.trim(),
                    email: s.email.trim(),
                    full_name: s.full_name.trim(),
                    nisn: s.nisn.trim(),
                    phone: s.phone.trim(),
                })),
            });

            setKelasId("");
            bulk.setItems([emptyStudent()]);
            bulk.clearErrors();
        } catch (e: any) {
            if (e?.status === 422 && e?.payload?.error === "VALIDATION_ERROR") {
                const errs = (e?.payload?.errors ?? {}) as Record<
                    string,
                    string[]
                >;
                bulk.setErrors(errs);
                bulk.scrollToFirstError();

                try {
                    const toastInfo = buildBulkToastFromErrors(
                        "students",
                        errs,
                    );
                    if (toastInfo) {
                        toast.error(toastInfo.title, {
                            description: toastInfo.description,
                        });
                    } else {
                        toast.error("Data tidak valid", {
                            description:
                                "Periksa kembali input yang ditandai merah.",
                        });
                    }
                } catch {
                    toast.error("Data tidak valid", {
                        description:
                            "Periksa kembali input yang ditandai merah.",
                    });
                }

                return;
            }

            toast.error("Gagal menambahkan siswa");
        }
    };

    return (
        <AdminLayout>
            <Head title="Tambah Siswa (Bulk)" />

            <Card>
                <CardHeader>
                    <CardTitle>Tambah Siswa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1 max-w-sm">
                        <Label>Pilih Kelas</Label>
                        <Select value={kelasId} onValueChange={setKelasId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih kelas..." />
                            </SelectTrigger>
                            <SelectContent>
                                {kelasOptions.map((k) => (
                                    <SelectItem key={k.id} value={String(k.id)}>
                                        {k.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <BulkGroups
                        title="Kelompok Input Siswa"
                        addLabel="Tambah Kelompok"
                        itemsLabelPrefix="Siswa"
                        bulk={bulk}
                        renderItem={(item, idx, api) => (
                            <BulkStudentFields
                                item={item}
                                idx={idx}
                                bulk={api}
                            />
                        )}
                    />

                    <div className="flex justify-end">
                        <Button onClick={onSubmit} disabled={!canSubmit}>
                            Simpan
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </AdminLayout>
    );
}

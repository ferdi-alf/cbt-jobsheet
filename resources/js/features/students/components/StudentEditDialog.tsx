import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { getStudentsDetail } from "../api/students.api";
import { toast } from "sonner";
import { useStudentMutations } from "../hooks/useStudentMutations";
import { StudentUpdatePayload } from "../types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem } from "@/Components/ui/select";
import { SelectTrigger, SelectValue } from "@radix-ui/react-select";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";

async function fetchKelasLookups() {
    const res = await fetch("/api/lookups/kelas");
    const json = await res.json();
    if (!json?.success) throw new Error(json?.error ?? "Gagal load kelas");
    return json.data as Array<{ id: number; name: string }>;
}

export default function StudentEditDialog({
    studentId,
    trigger,
}: {
    studentId: number;
    trigger: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const [kelasOptions, setKelasOptions] = useState<
        Array<{ id: number; name: string }>
    >([]);

    const detailQ = useQuery({
        queryKey: ["student-detail", studentId],
        queryFn: () => getStudentsDetail(studentId),
        enabled: open,
        staleTime: 60_00,
    });

    useEffect(() => {
        if (!open) return;
        fetchKelasLookups()
            .then(setKelasOptions)
            .catch((e) => toast.error(e.messagge));
    }, [open]);

    const { update } = useStudentMutations(() => setOpen(false));

    const initial = detailQ.data?.student;

    const [form, setForm] = useState<StudentUpdatePayload | null>(null);

    useEffect(() => {
        if (!initial) return;
        setForm({
            kelas_id: initial?.kelas_id ?? 0,
            username: initial?.username ?? "",
            email: initial?.email ?? "",
            password: "",
            full_name: initial?.full_name ?? "",
            nisn: initial?.nisn ?? "",
            gender: initial?.gender ?? "laki-laki",
            phone: initial?.phone ?? "",
        });
    }, [initial, open]);

    const canSubmit = useMemo(() => {
        if (!form) return false;
        return (
            !!form.kelas_id &&
            !!form.username.trim() &&
            !!form.email.trim() &&
            !!form.full_name.trim() &&
            !!form.nisn.trim() &&
            !!form.gender &&
            !!form.phone.trim()
        );
    }, [form]);

    const submit = async () => {
        if (!form) return;
        try {
            await update(studentId, {
                ...form,
                username: form.username.trim(),
                email: form.email.trim(),
                full_name: form.full_name.trim(),
                nisn: form.nisn.trim(),
                phone: form.phone.trim(),
                password: form.username.trim() ? form.password?.trim() : null,
            });
        } catch (e: any) {
            // passs
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>

            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Edit Siswa</DialogTitle>
                    <DialogDescription>Update data siswa.</DialogDescription>

                    {detailQ.isLoading || !form ? (
                        <div className="text-sm text-muted-foreground">
                            Loading...
                        </div>
                    ) : detailQ.error ? (
                        <div className="text-sm text-destructive">
                            {(detailQ.error as Error).message}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1 md:col-span-2">
                                <Label>Kelas</Label>
                                <Select
                                    value={String(form.kelas_id)}
                                    onValueChange={(v) =>
                                        setForm((p) =>
                                            p
                                                ? { ...p, kelas_id: Number(v) }
                                                : p,
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Kelas..." />
                                        <SelectContent>
                                            {kelasOptions.map((k) => (
                                                <SelectItem
                                                    key={k.id}
                                                    value={String(k.id)}
                                                >
                                                    {k.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </SelectTrigger>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label>Username</Label>
                                <Input
                                    value={form.username}
                                    onChange={(e) =>
                                        setForm((p) =>
                                            p
                                                ? {
                                                      ...p,
                                                      username: e.target.value,
                                                  }
                                                : p,
                                        )
                                    }
                                />
                            </div>

                            <div className="space-y-1">
                                <Label>Email</Label>
                                <Input
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm((p) =>
                                            p
                                                ? {
                                                      ...p,
                                                      email: e.target.value,
                                                  }
                                                : p,
                                        )
                                    }
                                />
                            </div>

                            <div className="space-y-1">
                                <Label>Nama Lengkap</Label>
                                <Input
                                    value={form.full_name}
                                    onChange={(e) =>
                                        setForm((p) =>
                                            p
                                                ? {
                                                      ...p,
                                                      full_name: e.target.value,
                                                  }
                                                : p,
                                        )
                                    }
                                />
                            </div>

                            <div className="space-y-1">
                                <Label>NISN</Label>
                                <Input
                                    value={form.nisn}
                                    onChange={(e) =>
                                        setForm((p) =>
                                            p
                                                ? {
                                                      ...p,
                                                      nisn: e.target.value,
                                                  }
                                                : p,
                                        )
                                    }
                                />
                            </div>

                            <div className="space-y-1">
                                <Label>Gender</Label>
                                <Select
                                    value={form.gender}
                                    onValueChange={(v) =>
                                        setForm((p) =>
                                            p ? { ...p, gender: v as any } : p,
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="laki-laki">
                                            Laki-laki
                                        </SelectItem>
                                        <SelectItem value="perempuan">
                                            Perempuan
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label>NO. HP</Label>
                                <Input
                                    value={form.phone}
                                    onChange={(e) =>
                                        setForm((p) =>
                                            p
                                                ? {
                                                      ...p,
                                                      phone: e.target.value,
                                                  }
                                                : p,
                                        )
                                    }
                                />
                            </div>

                            <div className="space-y-1">
                                <Label>Password (optional)</Label>
                                <Input
                                    type="password"
                                    value={form.password ?? ""}
                                    placeholder="kosongkan jika tidak ingin mengganti"
                                    onChange={(e) =>
                                        setForm((p) =>
                                            p
                                                ? {
                                                      ...p,
                                                      password: e.target.value,
                                                  }
                                                : p,
                                        )
                                    }
                                />
                            </div>

                            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                >
                                    Batal
                                </Button>
                                <Button onClick={submit} disabled={!canSubmit}>
                                    Simpan
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}

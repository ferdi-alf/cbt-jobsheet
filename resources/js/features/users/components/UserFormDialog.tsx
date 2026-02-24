import { useEffect, useMemo, useState } from "react";
import { UserRole, UserRow } from "../types";
import { useUserLookups } from "../hooks/useUserLookups";

import { FormState, mapInitialUserForm } from "../utils/useForm";
import { useUserMutations } from "../hooks/useUserMutations";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
} from "@/Components/ui/dialog";
import { DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";
import { Label } from "@/Components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";

type Props = {
    mode: "create" | "edit";
    trigger: React.ReactNode;
    initial?: UserRow;
    onSuccess: () => void;
};

export default function UserFormDialog({
    mode,
    trigger,
    initial,
    onSuccess,
}: Props) {
    const isEdit = mode === "edit";
    const [open, setOpen] = useState(false);

    const { kelas, mapels } = useUserLookups(open);
    const mutations = useUserMutations(() => {
        setOpen(false);
        onSuccess();
    });

    const [form, setForm] = useState<FormState>(() =>
        mapInitialUserForm(initial),
    );

    useEffect(() => {
        if (open) setForm(mapInitialUserForm(initial));
    }, [open, initial]);

    const showGuru = form.role === "guru";

    const canSubmit = useMemo(() => {
        if (!form.email.trim()) return false;

        if (!isEdit && form.password.trim().length < 8) return false;
        if (isEdit && form.password.trim() && form.password.trim().length < 8)
            return false;

        if (showGuru) {
            return (
                !!form.full_name.trim() &&
                !!form.nip.trim() &&
                !!form.gender &&
                !!form.phone.trim() &&
                !!form.kelas_id &&
                !!form.mapel_id
            );
        }

        return true;
    }, [form, isEdit, showGuru]);

    const set = (k: keyof FormState, v: string) =>
        setForm((p) => ({ ...p, [k]: v }));

    const submit = async () => {
        const base: any = {
            role: form.role,
            email: form.email,
            username: form.username ? form.username : null,
        };

        if (!isEdit) base.password = form.password;
        if (isEdit && form.password.trim()) base.password = form.password;

        if (form.role === "guru") {
            base.full_name = form.full_name;
            base.nip = form.nip;
            base.gender = form.gender;
            base.phone = form.phone;
            base.kelas_id = Number(form.kelas_id);
            base.mapel_id = Number(form.mapel_id);
        }

        if (isEdit) {
            await mutations.update(initial!.id, base);
        } else {
            await mutations.create(base);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>

            <DialogContent
                aria-describedby={undefined}
                className="sm:max-w-[560px] w-11/12"
            >
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Edit User" : "Tambah User"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Perbarui data user admin/guru."
                            : "Buat user admin atau guru."}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4  ">
                    <div className="grid gap-2">
                        <Label>Role</Label>
                        <Select
                            value={form.role}
                            onValueChange={(v: UserRole) => set("role", v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="guru">Guru</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Email</Label>
                        <Input
                            value={form.email}
                            onChange={(e) => set("email", e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Username</Label>
                        <Input
                            value={form.username}
                            onChange={(e) => set("username", e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>
                            {isEdit ? "Password (opsional)" : "Password"}
                        </Label>
                        <Input
                            type="password"
                            value={form.password}
                            onChange={(e) => set("password", e.target.value)}
                            placeholder={
                                isEdit
                                    ? "Kosongkan jika tidak diganti"
                                    : "Minimal 8 karakter"
                            }
                        />
                    </div>

                    {showGuru && (
                        <div className="rounded-l sm:h-48 h-44 overflow-auto border p-4 space-y-4">
                            <div className="font-medium">Detail Guru</div>

                            <div className="grid gap-2">
                                <Label>Nama Lengkap</Label>
                                <Input
                                    value={form.full_name}
                                    onChange={(e) =>
                                        set("full_name", e.target.value)
                                    }
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>NIP</Label>
                                <Input
                                    value={form.nip}
                                    onChange={(e) => set("nip", e.target.value)}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Jenis Kelamin</Label>
                                <Select
                                    value={form.gender}
                                    onValueChange={(v) => set("gender", v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih" />
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

                            <div className="grid gap-2">
                                <Label>No HP</Label>
                                <Input
                                    value={form.phone}
                                    onChange={(e) =>
                                        set("phone", e.target.value)
                                    }
                                />
                            </div>

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
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Batal
                    </Button>
                    <Button disabled={!canSubmit} onClick={submit}>
                        {isEdit ? "Update" : "Simpan"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

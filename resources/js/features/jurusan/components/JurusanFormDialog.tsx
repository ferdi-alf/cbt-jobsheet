// features/jurusan/components/JurusanFormDialog.tsx

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
import { useJurusanMutations } from "../hooks/useJurusanMutations";
import LogoDropzone from "./LogoDropzone";
import { JurusanRow } from "../type";

interface JurusanFormDialogProps {
    trigger: React.ReactNode;
    initial?: Pick<JurusanRow, "id" | "name" | "logo_url">;
}

export default function JurusanFormDialog({
    trigger,
    initial,
}: JurusanFormDialogProps) {
    const isEdit = !!initial;
    const [open, setOpen] = useState(false);

    const [name, setName] = useState(initial?.name ?? "");
    const [logo, setLogo] = useState<File | null>(null);
    const [nameError, setNameError] = useState<string>("");

    const { create, update } = useJurusanMutations(() => setOpen(false));

    const handleOpenChange = (val: boolean) => {
        if (val) {
            setName(initial?.name ?? "");
            setLogo(null);
            setNameError("");
        }
        setOpen(val);
    };

    const validate = () => {
        if (!name.trim()) {
            setNameError("Nama jurusan wajib diisi.");
            return false;
        }
        setNameError("");
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        if (isEdit) {
            await update(initial!.id, { name: name.trim(), logo });
        } else {
            await create({ name: name.trim(), logo });
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Edit Jurusan" : "Tambah Jurusan"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Nama */}
                    <div className="space-y-1.5">
                        <Label htmlFor="jurusan-name">
                            Nama Jurusan{" "}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="jurusan-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Contoh: Teknik Komputer dan Jaringan"
                            className={nameError ? "border-destructive" : ""}
                        />
                        {nameError && (
                            <p className="text-xs text-destructive">
                                {nameError}
                            </p>
                        )}
                    </div>

                    {/* Logo */}
                    <div className="space-y-1.5">
                        <Label>
                            Logo Jurusan{" "}
                            <span className="text-muted-foreground text-xs">
                                (opsional)
                            </span>
                        </Label>
                        <LogoDropzone
                            value={logo}
                            previewUrl={isEdit ? initial?.logo_url : null}
                            onChange={setLogo}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => setOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button type="button" onClick={handleSubmit}>
                            {isEdit ? "Simpan Perubahan" : "Buat Jurusan"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

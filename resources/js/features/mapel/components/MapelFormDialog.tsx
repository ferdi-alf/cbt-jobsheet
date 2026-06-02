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
import type { MapelFase, MapelRow } from "../types";
import { useMapelMutations } from "../hooks/useMapelMutation";

const FASE_OPTIONS: { value: MapelFase; label: string; desc: string }[] = [
    { value: "E", label: "Fase E", desc: "Kelas X" },
    { value: "F", label: "Fase F", desc: "Kelas XI & XII" },
    { value: "E,F", label: "Fase E & F", desc: "Semua tingkat" },
];

interface Props {
    trigger: React.ReactNode;
    initial?: Pick<MapelRow, "id" | "name" | "fase">;
    onDone?: () => void;
}

export default function MapelFormDialog({ trigger, initial, onDone }: Props) {
    const isEdit = !!initial;
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(initial?.name ?? "");
    const [fase, setFase] = useState<MapelFase | "">(initial?.fase ?? "");
    const [errors, setErrors] = useState<{ name?: string; fase?: string }>({});

    const { create, update } = useMapelMutations(() => {
        setOpen(false);
        onDone?.();
    });

    const handleOpenChange = (val: boolean) => {
        if (val) {
            setName(initial?.name ?? "");
            setFase(initial?.fase ?? "");
            setErrors({});
        }
        setOpen(val);
    };

    const validate = () => {
        const e: typeof errors = {};
        if (!name.trim()) e.name = "Nama mapel wajib diisi.";
        if (!fase) e.fase = "Fase wajib dipilih.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        const payload = { name: name.trim(), fase: fase as MapelFase };
        if (isEdit) await update(initial!.id, payload);
        else await create(payload);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Edit Mapel" : "Tambah Mapel"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>
                            Nama Mapel{" "}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Contoh: Matematika"
                            className={errors.name ? "border-destructive" : ""}
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label>
                            Fase <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={fase}
                            onValueChange={(v) => setFase(v as MapelFase)}
                        >
                            <SelectTrigger
                                className={
                                    errors.fase ? "border-destructive" : ""
                                }
                            >
                                <SelectValue placeholder="Pilih fase..." />
                            </SelectTrigger>
                            <SelectContent>
                                {FASE_OPTIONS.map((opt) => (
                                    <SelectItem
                                        key={opt.value}
                                        value={opt.value}
                                    >
                                        <div className="flex items-start flex-col">
                                            <span className="font-medium">
                                                {opt.label}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {opt.desc}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.fase && (
                            <p className="text-xs text-destructive">
                                {errors.fase}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button onClick={handleSubmit}>
                            {isEdit ? "Simpan" : "Buat Mapel"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

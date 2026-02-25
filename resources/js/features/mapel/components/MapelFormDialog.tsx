import { useEffect, useMemo, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { useMapelMutations } from "../hooks/useMapelMutation";

export default function MapelFormDialog({
    trigger,
    initial,
    onDone,
}: {
    trigger: React.ReactNode;
    initial?: { id: number; name: string } | null;
    onDone?: () => void;
}) {
    const isEdit = !!initial?.id;
    const [open, setOpen] = useState(false);

    const [name, setName] = useState(initial?.name ?? "");
    useEffect(() => setName(initial?.name ?? ""), [initial]);

    const { create, update } = useMapelMutations(() => {
        setOpen(false);
        onDone?.();
    });

    const title = useMemo(
        () => (isEdit ? "Edit Mapel" : "Tambah Mapel"),
        [isEdit],
    );

    const submit = async () => {
        if (!name.trim()) return;
        if (isEdit && initial) await update(initial.id, { name: name.trim() });
        else await create({ name: name.trim() });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>

            <DialogContent aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Isi nama mapel. Contoh: Matematika, TKJ, RPL, dll.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    <Label>Nama Mapel</Label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contoh: TKJ"
                    />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Batal
                    </Button>
                    <Button onClick={submit}>
                        {isEdit ? "Simpan" : "Tambah"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// features/jurusan/components/DeleteJurusanDialog.tsx

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { useJurusanMutations } from "../hooks/useJurusanMutations";

export default function DeleteJurusanDialog({
    jurusanId,
    jurusanName,
    trigger,
}: {
    jurusanId: number;
    jurusanName: string;
    trigger: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const { remove } = useJurusanMutations(() => setOpen(false));

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Hapus Jurusan</DialogTitle>
                    <DialogDescription>
                        Kamu yakin ingin menghapus jurusan <b>{jurusanName}</b>?
                        Jurusan yang masih dipakai kelas tidak dapat dihapus.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Batal
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => remove(jurusanId)}
                    >
                        Hapus
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

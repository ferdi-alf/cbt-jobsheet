import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { useState } from "react";
import { useKelasMutations } from "../hooks/useKelasMutations";

export default function DeleteKelasDialog({
    kelasId,
    kelasName,
    trigger,
}: {
    kelasId: number;
    kelasName: string;
    trigger: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const { remove } = useKelasMutations(() => setOpen(false));

    const onDelete = async () => {
        await remove(kelasId);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Hapus Kelas</DialogTitle>
                    <DialogDescription>
                        Kamu yakin ingin menghapus kelas <b>{kelasName}</b>?
                        Data terkait bisa ikut terpengaruh.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Batal
                    </Button>
                    <Button variant="destructive" onClick={onDelete}>
                        Hapus
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

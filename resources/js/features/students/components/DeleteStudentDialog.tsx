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
import { useStudentMutations } from "../hooks/useStudentMutations";

export default function DeleteStudentDialog({
    studentId,
    studentName,
    trigger,
}: {
    studentId: number;
    studentName: string;
    trigger: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const { remove } = useStudentMutations(() => setOpen(false));

    const onDelete = async () => {
        await remove(studentId);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Hapus Siswa</DialogTitle>
                    <DialogDescription>
                        Kamu yakin ingin menghapus siswa <b>{studentName}</b>?
                        Jika siswa sudah punya data nilai/praktik, sistem akan
                        menolak.
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

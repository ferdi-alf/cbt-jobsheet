import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/Components/ui/dialog";

export default function TimeUpDialog({ open }: { open: boolean }) {
    return (
        <Dialog open={open}>
            <DialogContent aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>Waktu habis</DialogTitle>
                    <DialogDescription>
                        Waktu pengerjaan telah berakhir. Jawaban Anda sedang
                        dikirim otomatis.
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}

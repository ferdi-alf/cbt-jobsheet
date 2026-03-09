import { useMemo, useState } from "react";
import { Button } from "@/Components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

type Props = {
    totalQuestions: number;
    answeredCount: number;
    submitting: boolean;
    onSubmit: () => void;
    className?: string;
};

export default function TestSubmitButton({
    totalQuestions,
    answeredCount,
    submitting,
    onSubmit,
    className,
}: Props) {
    const [open, setOpen] = useState(false);

    const unansweredCount = useMemo(
        () => Math.max(0, totalQuestions - answeredCount),
        [totalQuestions, answeredCount],
    );

    const handleClick = () => {
        if (submitting) return;
        if (unansweredCount > 0) {
            setOpen(true);
            return;
        }
        onSubmit();
    };

    const confirmSubmit = () => {
        setOpen(false);
        onSubmit();
    };

    return (
        <>
            <Button
                className={className}
                onClick={handleClick}
                disabled={submitting}
            >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {submitting ? "Mengirim..." : "Selesai & kirim"}
            </Button>

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Masih ada soal yang belum dijawab
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda masih memiliki <b>{unansweredCount}</b> soal
                            yang belum dijawab. Yakin tetap ingin mengumpulkan
                            jawaban sekarang?
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            Kembali cek jawaban
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={confirmSubmit}>
                            Ya, kumpulkan sekarang
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

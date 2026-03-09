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
    AlertDialogTrigger,
} from "@/Components/ui/alert-dialog";

export default function PracticeSubmitButton({
    disabled,
    emptyCount,
    submitting,
    onConfirm,
}: {
    disabled?: boolean;
    emptyCount: number;
    submitting?: boolean;
    onConfirm: (confirmIncomplete: boolean) => void;
}) {
    const hasEmpty = emptyCount > 0;

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    disabled={disabled || submitting}
                    className="w-full sm:w-auto"
                >
                    {submitting ? "Mengirim..." : "Kumpulkan praktek"}
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Yakin ingin mengumpulkan?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {hasEmpty
                            ? `Masih ada ${emptyCount} checklist yang belum memiliki foto. Submission tetap bisa dikirim, tetapi bagian yang kosong akan terlihat belum lengkap.`
                            : "Pastikan semua foto yang sudah diupload memang benar. Setelah dikumpulkan, foto tidak bisa diubah lagi dari sisi siswa."}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onConfirm(hasEmpty)}>
                        Ya, kumpulkan
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

import { ReactNode } from "react";
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
import { useTestMutations } from "../hooks/useTestMutations";

export default function DeleteTestDialog({
    testId,
    label,
    trigger,
    onSuccess,
}: {
    testId: number;
    label: string;
    trigger: ReactNode;
    onSuccess: () => void;
}) {
    const { remove } = useTestMutations(onSuccess);

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus test?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Test <b>{label}</b> akan dihapus permanen. Aksi ini
                        tidak bisa dibatalkan.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                        <Button variant="outline">Batal</Button>
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={() => remove(testId)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Hapus
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

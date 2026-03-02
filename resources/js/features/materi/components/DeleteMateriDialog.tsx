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
import { useMateriMutations } from "../hooks/useMateriMutations";

export default function DeleteMateriDialog({
    materiId,
    materiTitle,
    trigger,
    onSuccess,
}: {
    materiId: number;
    materiTitle: string;
    trigger: ReactNode;
    onSuccess?: () => void;
}) {
    const { remove } = useMateriMutations(onSuccess);

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus materi?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Materi <b>{materiTitle}</b> akan dihapus permanen. Aksi
                        ini tidak bisa dibatalkan.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                        <Button variant="outline">Batal</Button>
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={() => remove(materiId)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Hapus
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

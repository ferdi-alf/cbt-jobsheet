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
import { useUserMutations } from "../hooks/useUserMutations";

export default function DeleteUserDialog({
    userId,
    label,
    trigger,
    onSuccess,
}: {
    userId: number;
    label: string;
    trigger: ReactNode;
    onSuccess: () => void;
}) {
    const { remove } = useUserMutations(onSuccess);

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus user?</AlertDialogTitle>
                    <AlertDialogDescription>
                        User <b>{label}</b> akan dihapus permanen. Aksi ini
                        tidak bisa dibatalkan.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                        <Button variant="outline">Batal</Button>
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={() => remove(userId)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Hapus
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

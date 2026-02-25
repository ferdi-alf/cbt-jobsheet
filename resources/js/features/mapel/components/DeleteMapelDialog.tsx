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
import { ReactNode, useState } from "react";
import { useMapelMutations } from "../hooks/useMapelMutation";

export default function DeleteMapelDialog({
    mapelId,
    mapelName,
    trigger,
    onDone,
    disabled,
}: {
    mapelId: number;
    mapelName: string;
    trigger: ReactNode;
    onDone?: () => void;
    disabled?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const { remove } = useMapelMutations(() => {
        setOpen(false);
        onDone?.();
    });

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <span
                    className={disabled ? "pointer-events-none opacity-50" : ""}
                >
                    {trigger}
                </span>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Mapel?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Mapel <b>{mapelName}</b> akan dihapus permanen.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={() => remove(mapelId)}>
                        Hapus
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

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
import { usePracticeRuleMutations } from "../hooks/usePracticeRuleMutations";

export default function DeletePracticeRuleDialog({
    ruleId,
    label,
    trigger,
}: {
    ruleId: number;
    label: string;
    trigger: ReactNode;
}) {
    const { remove } = usePracticeRuleMutations();

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus rule?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Rule <b>{label}</b> akan dihapus permanen.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                        <Button variant="outline">Batal</Button>
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={() => remove(ruleId)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Hapus
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

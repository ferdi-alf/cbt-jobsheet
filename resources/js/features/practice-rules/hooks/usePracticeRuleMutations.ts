import { toast } from "sonner";
import { useProgress } from "@/Components/progress/ProgressProvider";
import { useQueryClient } from "@tanstack/react-query";
import {
    createPracticeRule,
    updatePracticeRule,
    deletePracticeRule,
    CreatePracticeRulePayload,
    UpdatePracticeRulePayload,
} from "../api/practiceRules.api";

export function usePracticeRuleMutations(onSuccess?: () => void) {
    const qc = useQueryClient();
    const { start, finish, fail } = useProgress();

    const invalidate = async () => {
        await qc.invalidateQueries({
            queryKey: ["table-data", "/api/practice-rules"],
        });
    };

    const create = async (payload: CreatePracticeRulePayload) => {
        try {
            start("Membuat rule praktek...");
            const res = await createPracticeRule(payload);
            await invalidate();
            finish();
            toast.success("Rule praktek berhasil dibuat");
            onSuccess?.();
            return res;
        } catch (e: any) {
            fail();
            toast.error(e?.message ?? "Gagal membuat rule praktek");
            throw e;
        }
    };

    const update = async (id: number, payload: UpdatePracticeRulePayload) => {
        try {
            start("Mengupdate rule praktek...");
            await updatePracticeRule(id, payload);
            await invalidate();
            finish();
            toast.success("Rule praktek berhasil diupdate");
            onSuccess?.();
            return true;
        } catch (e: any) {
            fail();
            toast.error(e?.message ?? "Gagal mengupdate rule praktek");
            throw e;
        }
    };

    const remove = async (id: number) => {
        try {
            start("Menghapus rule praktek...");
            await deletePracticeRule(id);
            await invalidate();
            finish();
            toast.success("Rule praktek berhasil dihapus");
            onSuccess?.();
            return true;
        } catch (e: any) {
            fail();
            toast.error(e?.message ?? "Gagal menghapus rule praktek");
            throw e;
        }
    };

    return { create, update, remove };
}

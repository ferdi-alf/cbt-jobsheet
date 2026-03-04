import { toast } from "sonner";
import { useProgress } from "@/Components/progress/ProgressProvider";
import { useQueryClient } from "@tanstack/react-query";
import {
    createTest,
    updateTest,
    deleteTest,
    CreateTestPayload,
    UpdateTestPayload,
} from "../api/tests.api";

export function useTestMutations(onDone?: () => void) {
    const qc = useQueryClient();
    const { start, finish, fail } = useProgress();

    const invalidate = async () => {
        await qc.invalidateQueries({ queryKey: ["table-data", "/api/tests"] });
    };

    const create = async (payload: CreateTestPayload) => {
        try {
            start("Membuat test...");
            const res = await createTest(payload);
            await invalidate();
            finish();
            toast.success("Test berhasil dibuat");
            onDone?.();
            return res;
        } catch (e: any) {
            fail();
            if (e?.status === 422) throw e;
            toast.error(e?.message ?? "Gagal membuat test");
            throw e;
        }
    };

    const update = async (id: number, payload: UpdateTestPayload) => {
        try {
            start("Mengupdate test...");
            await updateTest(id, payload);
            await invalidate();
            finish();
            toast.success("Test berhasil diupdate");
            onDone?.();
            return true;
        } catch (e: any) {
            fail();
            if (e?.status === 422) throw e;
            toast.error(e?.message ?? "Gagal membuat test");
            throw e;
        }
    };

    const remove = async (id: number) => {
        try {
            start("Menghapus test...");
            await deleteTest(id);
            await invalidate();
            finish();
            toast.success("Test berhasil dihapus");
            onDone?.();
            return true;
        } catch (e: any) {
            fail();
            if (e?.status === 422) throw e;
            toast.error(e?.message ?? "Gagal membuat test");
            throw e;
        }
    };

    return { create, update, remove };
}

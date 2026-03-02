import { toast } from "sonner";
import { useProgress } from "@/Components/progress/ProgressProvider";
import { useQueryClient } from "@tanstack/react-query";
import { createMateri, updateMateri, deleteMateri } from "../api/materi.api";

export function useMateriMutations(onSuccess?: () => void) {
    const qc = useQueryClient();
    const { start, finish, fail } = useProgress();

    const invalidateTable = async () => {
        await qc.invalidateQueries({
            queryKey: ["table-data", "/api/materis"],
        });
    };

    const create = async (form: FormData) => {
        try {
            start("Mengupload materi...");
            const res = await createMateri(form);
            await invalidateTable();
            finish();
            toast.success("Materi berhasil diupload");
            onSuccess?.();
            return res;
        } catch (e: any) {
            fail();
            const errs = e?.payload?.errors;
            const first = errs ? (Object.values(errs)[0] as any)?.[0] : null;
            toast.error(first ?? e?.message ?? "Gagal upload materi");
            throw e;
        }
    };

    const update = async (id: number, form: FormData) => {
        try {
            start("Mengupdate materi...");
            await updateMateri(id, form);
            await invalidateTable();
            finish();
            toast.success("Materi berhasil diupdate");
            onSuccess?.();
            return true;
        } catch (e: any) {
            fail();
            toast.error(e?.message ?? "Gagal update materi");
            throw e;
        }
    };

    const remove = async (id: number) => {
        try {
            start("Menghapus materi...");
            await deleteMateri(id);
            await invalidateTable();
            finish();
            toast.success("Materi berhasil dihapus");
            onSuccess?.();
            return true;
        } catch (e: any) {
            fail();
            toast.error(e?.message ?? "Gagal hapus materi");
            throw e;
        }
    };

    return { create, update, remove };
}

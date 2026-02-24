import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useProgress } from "@/Components/progress/ProgressProvider";
import { createKelas, updateKelas, deleteKelas } from "../api/kelas.api";

export function useKelasMutations(onSuccess?: () => void) {
    const qc = useQueryClient();
    const { start, finish, fail } = useProgress();

    const invalidate = async () => {
        await qc.invalidateQueries({ queryKey: ["table-data"] });
        await qc.invalidateQueries({ queryKey: ["kelas-overview"] });
        await qc.invalidateQueries({ queryKey: ["kelas-materials"] });
        await qc.invalidateQueries({ queryKey: ["kelas-students"] });
    };

    const create = async (payload: { name: string }) => {
        try {
            start("Membuat kelas...");
            const res = await createKelas(payload);
            await invalidate();
            finish();
            toast.success("Kelas berhasil dibuat");
            onSuccess?.();
            return res;
        } catch (e: any) {
            fail();
            toast.error(e?.message ?? "Gagal membuat kelas");
            throw e;
        }
    };

    const update = async (id: number, payload: { name: string }) => {
        try {
            start("Mengupdate kelas...");
            await updateKelas(id, payload);
            await invalidate();
            finish();
            toast.success("Kelas berhasil diupdate");
            onSuccess?.();
            return true;
        } catch (e: any) {
            fail();
            toast.error(e?.message ?? "Gagal mengupdate kelas");
            throw e;
        }
    };

    const remove = async (id: number) => {
        try {
            start("Menghapus kelas...");
            await deleteKelas(id);
            await invalidate();
            finish();
            toast.success("Kelas berhasil dihapus");
            onSuccess?.();
            return true;
        } catch (e: any) {
            fail();
            toast.error(e?.message ?? "Gagal menghapus kelas");
            throw e;
        }
    };

    return { create, update, remove };
}

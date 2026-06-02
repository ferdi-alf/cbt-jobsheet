import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useProgress } from "@/Components/progress/ProgressProvider";
import {
    createJurusan,
    updateJurusan,
    deleteJurusan,
} from "../api/jurusan.api";

export function useJurusanMutations(onSuccess?: () => void) {
    const qc = useQueryClient();
    const { start, finish, fail } = useProgress();

    const invalidate = async () => {
        await qc.invalidateQueries({ queryKey: ["table-data"] });
        await qc.invalidateQueries({ queryKey: ["jurusans-all"] });
    };

    const create = async (payload: { name: string; logo?: File | null }) => {
        try {
            start("Membuat jurusan...");
            const res = await createJurusan(payload);
            await invalidate();
            finish();
            toast.success("Jurusan berhasil dibuat");
            onSuccess?.();
            return res;
        } catch (e: any) {
            fail();
            toast.error(e?.message ?? "Gagal membuat jurusan");
            throw e;
        }
    };

    const update = async (
        id: number,
        payload: { name: string; logo?: File | null },
    ) => {
        try {
            start("Mengupdate jurusan...");
            const res = await updateJurusan(id, payload);
            await invalidate();
            finish();
            toast.success("Jurusan berhasil diupdate");
            onSuccess?.();
            return res;
        } catch (e: any) {
            fail();
            toast.error(e?.message ?? "Gagal mengupdate jurusan");
            throw e;
        }
    };

    const remove = async (id: number) => {
        try {
            start("Menghapus jurusan...");
            await deleteJurusan(id);
            await invalidate();
            finish();
            toast.success("Jurusan berhasil dihapus");
            onSuccess?.();
            return true;
        } catch (e: any) {
            fail();
            toast.error(e?.message ?? "Gagal menghapus jurusan");
            throw e;
        }
    };

    return { create, update, remove };
}

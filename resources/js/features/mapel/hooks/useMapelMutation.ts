import { toast } from "sonner";
import { useProgress } from "@/Components/progress/ProgressProvider";
import { createMapel, updateMapel, deleteMapel } from "../api/mapels.api";
import { useQueryClient } from "@tanstack/react-query";

export function useMapelMutations(onDone?: () => void) {
    const qc = useQueryClient();
    const { start, finish, fail } = useProgress();

    const invalidateMapels = async () => {
        await qc.invalidateQueries({
            queryKey: ["table-data", "/api/mapels"],
            exact: false,
        });

        await qc.invalidateQueries({
            queryKey: ["expandable-data"],
            exact: false,
        });
    };

    const create = async (payload: { name: string }) => {
        try {
            start("Membuat mapel...");
            const res = await createMapel(payload);
            await invalidateMapels();
            finish();
            toast.success("Mapel berhasil dibuat");
            onDone?.();
            return res;
        } catch (e: any) {
            fail();
            toast.error(e?.message ?? "Gagal membuat mapel");
            throw e;
        }
    };

    const update = async (id: number, payload: { name: string }) => {
        try {
            start("Mengupdate mapel...");
            await updateMapel(id, payload);
            await invalidateMapels();
            finish();
            toast.success("Mapel berhasil diupdate");
            onDone?.();
            return true;
        } catch (e: any) {
            fail();
            toast.error(e?.message ?? "Gagal mengupdate mapel");
            throw e;
        }
    };

    const remove = async (id: number) => {
        try {
            start("Menghapus mapel...");
            await deleteMapel(id);
            await invalidateMapels();
            finish();
            toast.success("Mapel berhasil dihapus");
            onDone?.();
            return true;
        } catch (e: any) {
            fail();
            toast.error(e?.message ?? "Gagal menghapus mapel");
            throw e;
        }
    };

    return { create, update, remove };
}

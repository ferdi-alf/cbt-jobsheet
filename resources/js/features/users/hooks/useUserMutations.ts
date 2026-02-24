import { toast } from "sonner";
import { useProgress } from "@/Components/progress/ProgressProvider";
import {
    createUser,
    updateUser,
    deleteUser,
    CreateUserPayload,
    UpdateUserPayload,
} from "../api/users.api";
import { useQueryClient } from "@tanstack/react-query";

export function useUserMutations(onSuccess?: () => void) {
    const qc = useQueryClient();
    const { start, finish, fail } = useProgress();

    const invalidateUsers = async () => {
        await qc.invalidateQueries({ queryKey: ["table-data", "/api/users"] });
    };

    const create = async (payload: CreateUserPayload) => {
        try {
            start("Membuat user...");
            const res = await createUser(payload);
            await invalidateUsers();
            finish();
            toast.success("User berhasil dibuat");
            onSuccess?.();
            return res;
        } catch (e: any) {
            fail();
            toast.error(e?.message ?? "Gagal membuat user");
            throw e;
        }
    };

    const update = async (id: number, payload: UpdateUserPayload) => {
        try {
            start("Mengupdate user...");
            await updateUser(id, payload);
            await invalidateUsers();
            finish();
            toast.success("User berhasil diupdate");
            onSuccess?.();
            return true;
        } catch (e: any) {
            fail();
            toast.error(e?.message ?? "Gagal mengupdate user");
            throw e;
        }
    };

    const remove = async (id: number) => {
        try {
            start("Menghapus user...");
            await deleteUser(id);
            await invalidateUsers();
            finish();
            toast.success("User berhasil dihapus");
            onSuccess?.();
            return true;
        } catch (e: any) {
            fail();
            toast.error(e?.message ?? "Gagal menghapus user");
            throw e;
        }
    };

    return { create, update, remove };
}

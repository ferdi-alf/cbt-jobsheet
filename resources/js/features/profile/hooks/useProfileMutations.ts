import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
    updateProfileAccount,
    updateProfilePassword,
    updateProfileDetail,
} from "../api/profile.api";
import type {
    UpdateAccountPayload,
    UpdatePasswordPayload,
    UpdateProfileDetailPayload,
} from "../types";
import { useProgress } from "@/Components/progress/ProgressProvider";

export function useProfileMutations(onSuccess?: () => void | Promise<void>) {
    const qc = useQueryClient();
    const { start, finish, fail } = useProgress();

    const refreshProfile = async () => {
        await qc.invalidateQueries({
            queryKey: ["profile"],
        });
    };

    const saveAccount = async (payload: UpdateAccountPayload) => {
        try {
            start("Memperbarui profile...");
            await updateProfileAccount(payload);
            await refreshProfile();
            toast.success("Akun berhasil diperbarui");
            finish();
            await onSuccess?.();
            return true;
        } catch (e: any) {
            fail();
            toast.error(e?.message ?? "Gagal memperbarui akun");
            throw e;
        }
    };

    const savePassword = async (payload: UpdatePasswordPayload) => {
        try {
            start("Memperbarui profile...");

            await updateProfilePassword(payload);
            toast.success("Password berhasil diperbarui");
            finish();
            await onSuccess?.();
            return true;
        } catch (e: any) {
            fail();

            toast.error(e?.message ?? "Gagal memperbarui password");
            throw e;
        }
    };

    const saveDetail = async (payload: UpdateProfileDetailPayload) => {
        try {
            start("Memperbarui profile...");
            await updateProfileDetail(payload);
            await refreshProfile();
            toast.success("Profil berhasil diperbarui");
            finish();
            await onSuccess?.();

            return true;
        } catch (e: any) {
            fail();

            toast.error(e?.message ?? "Gagal memperbarui profil");
            throw e;
        }
    };

    return { saveAccount, savePassword, saveDetail };
}

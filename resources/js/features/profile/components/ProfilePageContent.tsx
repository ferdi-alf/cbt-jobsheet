import { useEffect, useState } from "react";
import { toast } from "sonner";
import ProfileAccountCard from "./ProfileAccountCard";
import ProfilePasswordCard from "./ProfilePasswordCard";
import ProfileDetailCard from "./ProfileDetailCard";
import { useProfile } from "../hooks/useProfile";
import { useProfileMutations } from "../hooks/useProfileMutations";
import { usePasswordVisibility } from "../hooks/usePasswordVisibility";
import {
    mapAccountForm,
    mapDetailForm,
    mapPasswordForm,
    mapDetailPayload,
} from "../utils/profile.mapper";
import type {
    AccountFormState,
    PasswordFormState,
    DetailFormState,
} from "../types";

export default function ProfilePageContent() {
    const profile = useProfile();
    const visibility = usePasswordVisibility();
    const mutations = useProfileMutations();

    const [accountForm, setAccountForm] =
        useState<AccountFormState>(mapAccountForm());
    const [passwordForm, setPasswordForm] =
        useState<PasswordFormState>(mapPasswordForm());
    const [detailForm, setDetailForm] =
        useState<DetailFormState>(mapDetailForm());

    useEffect(() => {
        if (!profile.data) return;
        setAccountForm(mapAccountForm(profile.data));
        setDetailForm(mapDetailForm(profile.data));
    }, [profile.data]);

    const setAccount = (key: keyof AccountFormState, value: string) => {
        setAccountForm((p) => ({ ...p, [key]: value }));
    };

    const setPassword = (key: keyof PasswordFormState, value: string) => {
        setPasswordForm((p) => ({ ...p, [key]: value }));
    };

    const setDetail = (key: string, value: string) => {
        setDetailForm((prev) => ({ ...prev, [key]: value }) as DetailFormState);
    };

    const submitAccount = async () => {
        await mutations.saveAccount(accountForm);
    };

    const submitPassword = async () => {
        await mutations.savePassword(passwordForm);
        setPasswordForm(mapPasswordForm());
    };

    const submitDetail = async () => {
        const payload = mapDetailPayload(detailForm);
        if (!payload) {
            toast.error("Tidak ada data profil yang dapat diperbarui");
            return;
        }
        await mutations.saveDetail(payload);
    };

    if (profile.isLoading) {
        return (
            <div className="text-sm text-muted-foreground">
                Memuat profile...
            </div>
        );
    }

    if (profile.isError) {
        return (
            <div className="text-sm text-destructive">
                {profile.error?.message ?? "Gagal memuat profile."}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <ProfileAccountCard
                form={accountForm}
                onChange={setAccount}
                onSubmit={submitAccount}
            />

            <ProfilePasswordCard
                form={passwordForm}
                onChange={setPassword}
                onSubmit={submitPassword}
                visibility={visibility}
            />

            <ProfileDetailCard
                form={detailForm}
                onChange={setDetail}
                onSubmit={submitDetail}
            />
        </div>
    );
}

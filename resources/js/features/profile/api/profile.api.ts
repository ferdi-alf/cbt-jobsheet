import { api } from "@/lib/http";
import {
    ProfileResponse,
    UpdateAccountPayload,
    UpdatePasswordPayload,
    UpdateProfileDetailPayload,
} from "../types";

export async function getProfile() {
    return api.get<ProfileResponse>("/api/profile");
}

export async function updateProfileAccount(payload: UpdateAccountPayload) {
    return api.put<boolean>("/api/profile/account", payload);
}

export async function updateProfilePassword(payload: UpdatePasswordPayload) {
    return api.put<boolean>("/api/profile/password", payload);
}

export async function updateProfileDetail(payload: UpdateProfileDetailPayload) {
    return api.put<boolean>("/api/profile/detail", payload);
}

import { useQuery } from "@tanstack/react-query";
import { getProfile } from "../api/profile.api";
import type { ProfileResponse } from "../types";

export function useProfile() {
    return useQuery<ProfileResponse, Error>({
        queryKey: ["profile"],
        queryFn: getProfile,
        staleTime: 60_000,
    });
}

import { api } from "@/lib/http";
import type { PosttestListResponse } from "../types";

export async function fetchPosttests(params?: {
    page?: number;
    limit?: number;
    search?: string;
}) {
    const query = new URLSearchParams();
    query.set("page", String(params?.page ?? 1));
    query.set("limit", String(params?.limit ?? 8));

    const search = params?.search?.trim();
    if (search) query.set("search", search);

    return api.get<PosttestListResponse>(
        `/api/siswa/posttests?${query.toString()}`,
    );
}

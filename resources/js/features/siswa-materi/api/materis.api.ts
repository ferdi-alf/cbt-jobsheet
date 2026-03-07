import { api } from "@/lib/http";
import type { SiswaMateriItem } from "../types";

export async function fetchSiswaMateris() {
    return api.get<SiswaMateriItem[]>("/api/materis");
}

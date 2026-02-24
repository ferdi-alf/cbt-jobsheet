import type { UserRow } from "../types";
import { api } from "@/lib/http";

export type CreateUserPayload =
    | {
          role: "admin";
          email: string;
          username?: string | null;
          password: string;
      }
    | {
          role: "guru";
          email: string;
          username?: string | null;
          password: string;
          full_name: string;
          nip: string;
          gender: "laki-laki" | "perempuan";
          phone: string;
          kelas_id: number;
          mapel_id: number;
      };

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, "password">> & {
    password?: string;
};

export async function createUser(payload: CreateUserPayload) {
    return api.post<{ id: number }>("/api/users", payload);
}

export async function updateUser(id: number, payload: UpdateUserPayload) {
    return api.put<boolean>(`/api/users/${id}`, payload);
}

export async function deleteUser(id: number) {
    return api.del<boolean>(`/api/users/${id}`);
}

export async function getUser(id: number) {
    return api.get<UserRow>(`/api/users/${id}`);
}

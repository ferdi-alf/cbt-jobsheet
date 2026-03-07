export interface User {
    id: number;
    name?: string | null;
    email: string;
    email_verified_at?: string;
    role?: "admin" | "guru" | "siswa" | null;
    avatar_path?: string | null;
    profile?: {
        full_name?: string | null;
    };
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};

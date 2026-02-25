export type ApiResponse<T> = {
    success: boolean;
    data: T;
    meta?: any;
    error?: string | null;
};

function getCsrfToken() {
    if (typeof document === "undefined") return "";
    const el = document.querySelector(
        'meta[name="csrf-token"]',
    ) as HTMLMetaElement | null;
    return el?.content ?? "";
}

function getApiBaseUrl() {
    const base = (import.meta as any).env?.VITE_APP_URL as string | undefined;

    return (base?.trim() || window.location.origin).replace(/\/$/, "");
}

function buildUrl(path: string) {
    if (/^https?:\/\//i.test(path)) return path;
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${getApiBaseUrl()}${p}`;
}

async function readNonJsonBody(res: Response) {
    const text = await res.text().catch(() => "");
    return text.slice(0, 200);
}

export class ApiError extends Error {
    status: number;
    bodyPreview?: string;

    constructor(message: string, status: number, bodyPreview?: string) {
        super(message);
        this.status = status;
        this.bodyPreview = bodyPreview;
    }
}

export async function apiRequest<T>(
    path: string,
    init: RequestInit = {},
): Promise<T> {
    const url = buildUrl(path);

    const res = await fetch(url, {
        ...init,
        credentials: "include",
        headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRF-TOKEN": getCsrfToken(),
            ...(init.headers ?? {}),
        },
    });

    const contentType = res.headers.get("content-type") || "";

    if (res.status === 419) {
        const preview = await readNonJsonBody(res);
        throw new ApiError(
            "CSRF token mismatch (419). Pastikan request membawa cookie session & meta csrf-token ada.",
            419,
            preview,
        );
    }

    if (!contentType.includes("application/json")) {
        const preview = await readNonJsonBody(res);
        throw new ApiError(
            `Non-JSON response (${res.status}). Kemungkinan redirect/login/CSRF.`,
            res.status,
            preview,
        );
    }

    const json = (await res.json()) as ApiResponse<T>;

    if (!res.ok || !json.success) {
        throw new ApiError(
            json?.error || `Request failed (${res.status})`,
            res.status,
        );
    }

    return json.data;
}

export const api = {
    get: <T>(path: string) => apiRequest<T>(path, { method: "GET" }),
    post: <T>(path: string, body?: any) =>
        apiRequest<T>(path, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: body !== undefined ? JSON.stringify(body) : undefined,
        }),
    put: <T>(path: string, body?: any) =>
        apiRequest<T>(path, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: body !== undefined ? JSON.stringify(body) : undefined,
        }),
    del: <T>(path: string) => apiRequest<T>(path, { method: "DELETE" }),
};

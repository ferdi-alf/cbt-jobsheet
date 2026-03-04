export type ApiResponse<T> = {
    success: boolean;
    data: T;
    meta?: any;
    error?: string | null;
    errors?: Record<string, string[]>;
};

function getXsrfTokenFromCookie(): string {
    if (typeof document === "undefined") return "";

    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    if (!match) return "";

    return decodeURIComponent(match[1]);
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

    payload?: any;

    constructor(
        message: string,
        status: number,
        opts?: { bodyPreview?: string; payload?: any },
    ) {
        super(message);
        this.status = status;
        this.bodyPreview = opts?.bodyPreview;
        this.payload = opts?.payload;
    }
}

export async function apiRequest<T>(
    path: string,
    init: RequestInit = {},
): Promise<T> {
    const url = buildUrl(path);

    const isFormData =
        typeof FormData !== "undefined" && init.body instanceof FormData;

    const headers: Record<string, string> = {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-XSRF-TOKEN": getXsrfTokenFromCookie(),
    };

    if (!isFormData) {
        Object.assign(headers, init.headers ?? {});
    } else {
        Object.assign(headers, init.headers ?? {});
        delete (headers as any)["Content-Type"];
    }

    const res = await fetch(url, {
        ...init,
        credentials: "include",
        headers,
    });

    const contentType = res.headers.get("content-type") || "";

    if (res.status === 419) {
        const preview = await readNonJsonBody(res);
        throw new ApiError(
            "CSRF token mismatch (419). Pastikan request membawa cookie session & meta csrf-token ada.",
            419,
            { bodyPreview: preview },
        );
    }

    if (!contentType.includes("application/json")) {
        const preview = await readNonJsonBody(res);
        throw new ApiError(
            `Non-JSON response (${res.status}). Kemungkinan redirect/login/CSRF.`,
            res.status,
            { bodyPreview: preview },
        );
    }

    const json = (await res.json()) as any;
    if (!res.ok) {
        const msg =
            json?.error || json?.message || `Request failed (${res.status})`;

        throw new ApiError(msg, res.status, { payload: json });
    }

    if (typeof json?.success === "boolean" && !json.success) {
        throw new ApiError(
            json?.error || `Request failed (${res.status})`,
            res.status,
            {
                payload: json,
            },
        );
    }

    return (typeof json?.success === "boolean" ? json.data : json) as T;
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

    postForm: <T>(path: string, form: FormData) =>
        apiRequest<T>(path, { method: "POST", body: form }),
    putForm: <T>(path: string, form: FormData) =>
        apiRequest<T>(path, { method: "PUT", body: form }),
};

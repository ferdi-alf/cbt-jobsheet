import type { TestOptionValue } from "../types";

export type StoredTestSnapshot = {
    currentIndex: number;
    answers: Record<number, TestOptionValue>;
    expiresAt?: string | null;
    updatedAt: number;
};

function key(publicKey: string) {
    return `cbt-test-session:${publicKey}`;
}

export function loadTestSnapshot(publicKey: string): StoredTestSnapshot | null {
    if (typeof window === "undefined") return null;

    try {
        const raw = localStorage.getItem(key(publicKey));
        if (!raw) return null;
        return JSON.parse(raw) as StoredTestSnapshot;
    } catch {
        return null;
    }
}

export function saveTestSnapshot(
    publicKey: string,
    snapshot: StoredTestSnapshot,
) {
    if (typeof window === "undefined") return;
    localStorage.setItem(key(publicKey), JSON.stringify(snapshot));
}

export function clearTestSnapshot(publicKey: string) {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key(publicKey));
}

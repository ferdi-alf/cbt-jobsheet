import { useEffect, useMemo, useState } from "react";

export function useTestTimer(expiresAt?: string | null) {
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        const id = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, []);

    const remainingSeconds = useMemo(() => {
        if (!expiresAt) return 0;
        const diff = Math.floor((new Date(expiresAt).getTime() - now) / 1000);
        return Math.max(0, diff);
    }, [expiresAt, now]);

    return {
        remainingSeconds,
        isExpired: remainingSeconds <= 0,
    };
}

export function formatSeconds(totalSeconds: number) {
    const safe = Math.max(0, totalSeconds);
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const seconds = safe % 60;

    if (hours > 0) {
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

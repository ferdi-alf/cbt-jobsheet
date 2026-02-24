import {
    createContext,
    ReactNode,
    useContext,
    useMemo,
    useRef,
    useState,
} from "react";

type ProgressState = {
    open: boolean;
    percent: number;
    label?: string;
};

type ProgressApi = {
    start: (label?: string) => void;
    finish: () => void;
    fail: () => void;
    state: ProgressState;
};

const ProgressContext = createContext<ProgressApi | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<ProgressState>({
        open: false,
        percent: 0,
    });
    const timerRef = useRef<number | null>(null);

    const clearTimer = () => {
        if (timerRef.current) window.clearInterval(timerRef.current);
        timerRef.current = null;
    };

    const start = (label?: string) => {
        clearTimer();
        setState({ open: true, percent: 5, label });

        timerRef.current = window.setInterval(() => {
            setState((prev) => {
                if (!prev.open) return prev;
                const next =
                    prev.percent +
                    Math.max(1, Math.round((90 - prev.percent) / 12));
                return { ...prev, percent: Math.min(90, next) };
            });
        }, 250);
    };

    const finish = () => {
        clearTimer();
        setState((prev) => ({ ...prev, percent: 100 }));
        window.setTimeout(() => setState({ open: false, percent: 0 }), 350);
    };

    const fail = () => {
        clearTimer();
        setState((prev) => ({ ...prev, percent: 100 }));
        window.setTimeout(() => setState({ open: false, percent: 0 }), 350);
    };

    const value = useMemo(() => ({ start, finish, fail, state }), [state]);

    return (
        <ProgressContext.Provider value={value}>
            {children}
        </ProgressContext.Provider>
    );
}

export function useProgress() {
    const ctx = useContext(ProgressContext);
    if (!ctx)
        throw new Error("useProgress must be used within ProgressProvider");
    return ctx;
}

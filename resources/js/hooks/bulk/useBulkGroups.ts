import { useCallback, useRef, useState } from "react";

type ErrorBag = Record<string, string[]>;

type UseBulkGroupsOptions<T> = {
    initialItem: () => T;
    initialItems?: T[];
    errorPrefix: string;
};

function isScrollable(el: HTMLElement) {
    const style = window.getComputedStyle(el);
    const overflowY = style.overflowY;
    return (
        (overflowY === "auto" || overflowY === "scroll") &&
        el.scrollHeight > el.clientHeight
    );
}

function getScrollParent(el: HTMLElement | null): HTMLElement | Window {
    let current = el?.parentElement ?? null;

    while (current) {
        if (isScrollable(current)) return current;
        current = current.parentElement;
    }

    return window;
}

function smoothScrollToTarget(target: HTMLElement) {
    const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;

    const behavior: ScrollBehavior = prefersReduced ? "auto" : "smooth";
    const container = getScrollParent(target);

    if (container === window) {
        const rect = target.getBoundingClientRect();
        const top = window.scrollY + rect.top - 120;
        window.scrollTo({
            top: Math.max(0, top),
            behavior,
        });
    } else {
        const parent = container as HTMLElement;
        const parentRect = parent.getBoundingClientRect();
        const rect = target.getBoundingClientRect();
        const top = parent.scrollTop + (rect.top - parentRect.top) - 96;

        parent.scrollTo({
            top: Math.max(0, top),
            behavior,
        });
    }

    window.setTimeout(
        () => {
            try {
                target.focus?.({ preventScroll: true } as FocusOptions);
            } catch {
                target.focus?.();
            }
        },
        prefersReduced ? 0 : 260,
    );
}

function escapeAttr(value: string) {
    if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
        return CSS.escape(value);
    }

    return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function useBulkGroups<T extends Record<string, any>>({
    initialItem,
    initialItems,
    errorPrefix,
}: UseBulkGroupsOptions<T>) {
    const [items, setItems] = useState<T[]>(
        initialItems?.length ? initialItems : [initialItem()],
    );
    const [errors, setErrorsState] = useState<ErrorBag>({});

    const errorsRef = useRef<ErrorBag>({});
    const rafRef = useRef<number | null>(null);
    const groupRefsRef = useRef<Record<number, HTMLElement | null>>({});

    const setErrors = useCallback((next: ErrorBag) => {
        const normalized = next ?? {};
        errorsRef.current = normalized;
        setErrorsState(normalized);
    }, []);

    const clearErrors = useCallback(() => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }

        errorsRef.current = {};
        setErrorsState({});
    }, []);

    const update = useCallback((index: number, patch: Partial<T>) => {
        setItems((prev) =>
            prev.map((item, idx) =>
                idx === index ? { ...item, ...patch } : item,
            ),
        );
    }, []);

    const add = useCallback(() => {
        setItems((prev) => [...prev, initialItem()]);
    }, [initialItem]);

    const remove = useCallback((index: number) => {
        setItems((prev) => {
            if (prev.length <= 1) return prev;
            return prev.filter((_, idx) => idx !== index);
        });

        delete groupRefsRef.current[index];
    }, []);

    const getFieldError = useCallback(
        (index: number, field: string) => {
            const key = `${errorPrefix}.${index}.${field}`;
            return errors[key]?.[0] ?? null;
        },
        [errorPrefix, errors],
    );

    const hasGroupError = useCallback(
        (index: number) => {
            const prefix = `${errorPrefix}.${index}.`;
            return Object.keys(errors).some((key) => key.startsWith(prefix));
        },
        [errorPrefix, errors],
    );

    const setGroupRef = useCallback((index: number, el: HTMLElement | null) => {
        groupRefsRef.current[index] = el;
    }, []);

    const findFirstErrorElement = useCallback(
        (source: ErrorBag) => {
            const keys = Object.keys(source);

            for (const key of keys) {
                const exact = document.querySelector<HTMLElement>(
                    `[data-error-key="${escapeAttr(key)}"]`,
                );
                if (exact) return exact;

                if (key.startsWith(`${errorPrefix}.`)) {
                    const parts = key.split(".");
                    const index = Number(parts[1]);

                    if (!Number.isNaN(index)) {
                        const byAttr = document.querySelector<HTMLElement>(
                            `[data-bulk-group-index="${index}"]`,
                        );
                        if (byAttr) return byAttr;

                        const byRef = groupRefsRef.current[index];
                        if (byRef) return byRef;
                    }
                }
            }

            return null;
        },
        [errorPrefix],
    );

    const scrollToFirstError = useCallback(
        (source?: ErrorBag) => {
            const bag = source ?? errorsRef.current;
            if (!Object.keys(bag).length) return;

            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }

            let attempt = 0;

            const run = () => {
                const target = findFirstErrorElement(bag);

                if (target) {
                    smoothScrollToTarget(target);
                    rafRef.current = null;
                    return;
                }

                attempt += 1;
                if (attempt < 10) {
                    rafRef.current = requestAnimationFrame(run);
                }
            };

            rafRef.current = requestAnimationFrame(() => {
                rafRef.current = requestAnimationFrame(run);
            });
        },
        [findFirstErrorElement],
    );

    return {
        items,
        setItems,
        update,
        add,
        remove,
        errors,
        setErrors,
        clearErrors,
        getFieldError,
        hasGroupError,
        setGroupRef,
        scrollToFirstError,
        errorPrefix,
    };
}

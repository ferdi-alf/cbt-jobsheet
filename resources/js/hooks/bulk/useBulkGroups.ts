import { useMemo, useRef, useState } from "react";

export type BulkErrors = Record<string, string[]>;

export type UseBulkGroupsOptions<T> = {
    initialItem: () => T;
    initialItems?: T[];
    errorPrefix: string;
};

export function useBulkGroups<T>(opts: UseBulkGroupsOptions<T>) {
    const { initialItem, initialItems, errorPrefix } = opts;

    const [items, setItems] = useState<T[]>(
        initialItems && initialItems.length ? initialItems : [initialItem()],
    );

    const groupRefs = useRef<Record<number, HTMLDivElement | null>>({});
    const setGroupRef = (idx: number) => (el: HTMLDivElement | null) => {
        groupRefs.current[idx] = el;
    };

    const [errors, setErrors] = useState<BulkErrors | null>(null);

    const add = () => setItems((prev) => [...prev, initialItem()]);

    const remove = (idx: number) =>
        setItems((prev) => {
            const next = prev.filter((_, i) => i !== idx);
            return next.length ? next : [initialItem()];
        });

    const update = (idx: number, patch: Partial<T>) =>
        setItems((prev) =>
            prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
        );

    const replace = (next: T[]) =>
        setItems(next.length ? next : [initialItem()]);

    const clearErrors = () => setErrors(null);

    const getFieldError = <K extends string>(idx: number, field: K) => {
        const key = `${errorPrefix}.${idx}.${field}`;
        return errors?.[key]?.[0] ?? null;
    };

    const hasGroupError = (idx: number) => {
        if (!errors) return false;
        const prefix = `${errorPrefix}.${idx}`;
        return Object.keys(errors).some((k) => k.startsWith(prefix));
    };

    const firstErrorIndex = useMemo(() => {
        if (!errors) return null;
        const keys = Object.keys(errors).filter((k) =>
            k.startsWith(`${errorPrefix}.`),
        );
        const idxs = keys
            .map((k) => Number(k.split(".")[1]))
            .filter((n) => Number.isFinite(n))
            .sort((a, b) => a - b);
        return idxs.length ? idxs[0] : null;
    }, [errors, errorPrefix]);

    const scrollToFirstError = () => {
        if (firstErrorIndex === null) return;
        groupRefs.current[firstErrorIndex]?.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    };

    const scrollTo = (idx: number) => {
        groupRefs.current[idx]?.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    };

    return {
        items,
        setItems: replace,

        add,
        remove,
        update,

        errors,
        setErrors,
        clearErrors,

        getFieldError,
        hasGroupError,

        setGroupRef,
        scrollToFirstError,
        scrollTo,
        firstErrorIndex,
        errorPrefix,
    };
}

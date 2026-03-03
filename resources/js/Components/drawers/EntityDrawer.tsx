import { ReactNode, useMemo, useState } from "react";
import SlideDrawerShell from "./shells/SlideDrawerShell";
import BottomDrawerShell from "./shells/BottomDrawerShell";
import { useQuery } from "@tanstack/react-query";

type Variant = "bottom" | "slide";

type EntityDrawerProps<TData> = {
    variant?: Variant;
    title: string;
    trigger: ReactNode;
    id?: string | number;
    fetcher?: (id: string | number) => Promise<TData>;
    cacheKey?: (id: string | number) => unknown[];
    open?: boolean;
    onOpenChange?: (v: boolean) => void;

    render: (args: {
        data?: TData;
        loading: boolean;
        error: string | null;
        close: () => void;
    }) => ReactNode;
};

export default function EntityDrawer<TData>({
    variant = "bottom",
    title,
    trigger,
    id,
    fetcher,
    cacheKey,
    open,
    onOpenChange,
    render,
}: EntityDrawerProps<TData>) {
    const [internalOpen, setInternalOpen] = useState(false);

    const isControlled = typeof open === "boolean" && !!onOpenChange;
    const actualOpen = isControlled ? open : internalOpen;
    const setOpen = isControlled ? onOpenChange! : setInternalOpen;

    const close = () => setOpen(false);

    const enabled = actualOpen && !!id && !!fetcher;

    const queryKey = useMemo(() => {
        if (!id) return ["entity-drawer", title, "no-id"];
        if (cacheKey) return cacheKey(id);
        return ["entity-drawer", title, id];
    }, [id, cacheKey, title]);

    const query = useQuery<TData, Error>(
        queryKey,
        async () => {
            if (!fetcher || id === undefined)
                throw new Error("Missing fetcher/id");
            return fetcher(id);
        },
        {
            enabled,
            staleTime: 60_000,
            cacheTime: 10 * 60 * 1000,
        },
    );

    const content = render({
        data: fetcher ? query.data : undefined,
        loading: fetcher ? query.isLoading : false,
        error: fetcher ? (query.error?.message ?? null) : null,
        close,
    });

    if (variant === "slide") {
        return (
            <>
                <span onClick={() => setOpen(true)}>{trigger}</span>
                <SlideDrawerShell
                    open={actualOpen}
                    onClose={close}
                    title={title}
                >
                    {content}
                </SlideDrawerShell>
            </>
        );
    }

    return (
        <BottomDrawerShell
            open={actualOpen}
            onOpenChange={setOpen}
            title={title}
            trigger={trigger}
        >
            {content}
        </BottomDrawerShell>
    );
}

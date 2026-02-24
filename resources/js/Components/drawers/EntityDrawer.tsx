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
    render,
}: EntityDrawerProps<TData>) {
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);

    const enabled = open && !!id && !!fetcher;

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
                <SlideDrawerShell open={open} onClose={close} title={title}>
                    {content}
                </SlideDrawerShell>
            </>
        );
    }

    return (
        <BottomDrawerShell
            open={open}
            onOpenChange={setOpen}
            title={title}
            trigger={trigger}
        >
            {content}
        </BottomDrawerShell>
    );
}

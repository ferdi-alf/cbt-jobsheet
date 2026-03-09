import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
};

export default function SlideDrawerShell({
    open,
    onClose,
    title,
    children,
}: Props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <div
            className={cn(
                "fixed inset-0 z-50",
                open ? "pointer-events-auto" : "pointer-events-none",
            )}
        >
            <div
                onClick={onClose}
                className={cn(
                    "absolute inset-0 bg-black/40 transition-opacity duration-200",
                    open ? "opacity-100" : "opacity-0",
                )}
            />

            <div
                className={cn(
                    "absolute inset-0 bg-background shadow-xl transition-transform duration-200 will-change-transform",
                    open ? "translate-x-0" : "translate-x-full",
                )}
            >
                <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background px-4 py-3">
                    <button
                        onClick={onClose}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
                        aria-label="Back"
                        title="Tutup"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="font-semibold truncate">{title}</div>
                </div>

                <div className="h-[calc(100vh-56px)] overflow-auto pb-4 pl-4 pr-4">
                    {children}
                </div>
            </div>
        </div>,
        document.body,
    );
}

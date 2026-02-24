import { ReactNode } from "react";
import { X } from "lucide-react";
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
    return (
        <div
            className={cn(
                "fixed inset-0 z-50",
                open ? "pointer-events-auto" : "pointer-events-none",
            )}
        >
            {/* overlay */}
            <div
                onClick={onClose}
                className={cn(
                    "absolute inset-0 bg-black/40 transition-opacity",
                    open ? "opacity-100" : "opacity-0",
                )}
            />

            {/* panel */}
            <div
                className={cn(
                    "absolute right-0 top-0 h-full w-full max-w-xl bg-background border-l shadow-xl transition-transform",
                    open ? "translate-x-0" : "translate-x-full",
                )}
            >
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <div className="font-semibold">{title}</div>
                    <button
                        onClick={onClose}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="p-4">{children}</div>
            </div>
        </div>
    );
}

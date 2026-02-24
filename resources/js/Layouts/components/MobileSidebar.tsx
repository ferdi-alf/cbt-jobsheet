import { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileSidebar({
    open,
    onClose,
    children,
}: {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
}) {
    return (
        <div
            className={cn(
                "md:hidden fixed inset-0 z-50",
                open ? "pointer-events-auto" : "pointer-events-none",
            )}
        >
            <div
                className={cn(
                    "absolute inset-0 bg-black/40 transition-opacity",
                    open ? "opacity-100" : "opacity-0",
                )}
                onClick={onClose}
            />
            <div
                className={cn(
                    "absolute left-0 top-0 h-full w-[280px] bg-background border-r shadow-xl transition-transform",
                    open ? "translate-x-0" : "-translate-x-full",
                )}
            >
                <div className="h-14 px-4 flex items-center justify-between border-b">
                    <div className="font-semibold">Menu</div>
                    <button
                        onClick={onClose}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
                        aria-label="Close sidebar"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="p-3">{children}</div>
            </div>
        </div>
    );
}

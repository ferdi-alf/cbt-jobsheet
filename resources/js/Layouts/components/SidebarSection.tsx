import { PropsWithChildren } from "react";

export default function SidebarSection({ children }: PropsWithChildren) {
    return (
        <div className="px-3 pt-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {children}
            </div>
        </div>
    );
}

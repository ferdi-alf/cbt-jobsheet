import { Link, usePage } from "@inertiajs/react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type Props = {
    href: string;
    icon?: ReactNode;
    children: ReactNode;
    activePathStartsWith?: string;
};

function toPathname(href: string): string {
    // kalau href absolute, ambil pathname-nya
    try {
        return new URL(href, window.location.origin).pathname;
    } catch {
        return href;
    }
}

export default function SidebarItem({
    href,
    icon,
    children,
    activePathStartsWith,
}: Props) {
    const { url } = usePage();

    const hrefPath = typeof window !== "undefined" ? toPathname(href) : href;

    const isActive = activePathStartsWith
        ? url.startsWith(activePathStartsWith)
        : url === hrefPath;

    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
                "hover:bg-muted",
                isActive && "bg-muted font-medium",
            )}
        >
            {icon}
            <span>{children}</span>
        </Link>
    );
}

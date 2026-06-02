import UserAvatar from "@/Components/common/UserAvatar";
import { Button } from "@/Components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { usePage, router } from "@inertiajs/react";
import { Menu } from "lucide-react";

export default function MobileTopbar({
    onOpenSidebar,
}: {
    onOpenSidebar: () => void;
}) {
    const { props } = usePage<any>();
    const user = props.auth?.user;

    return (
        <div
            className="md:hidden fixed top-0 left-0 right-0 z-40 h-14"
            style={{
                background:
                    "linear-gradient(135deg, #1a3a6b 0%, #1565C0 60%, #0d47a1 100%)",
            }}
        >
            <div className="h-full px-3 flex items-center justify-between gap-2">
                {/* Hamburger */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onOpenSidebar}
                    aria-label="Open sidebar"
                    className="text-white hover:bg-white/10 shrink-0"
                >
                    <Menu className="h-5 w-5" />
                </Button>

                {/* Logos — center */}
                <div className="flex items-center gap-2 flex-1 justify-center">
                    <img
                        src="/storage/logo/logo-1.png"
                        alt="Logo 1"
                        className="h-6 w-auto object-contain"
                    />
                    <div
                        className="h-6 w-px shrink-0"
                        style={{ background: "rgba(255,255,255,0.35)" }}
                    />
                    <img
                        src="/storage/logo/logo-2.png"
                        alt="Logo 2"
                        className="h-6 w-auto object-contain"
                    />
                </div>

                {/* Avatar */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="rounded-full shrink-0 ring-2 ring-white/30 hover:ring-white/60 transition-all">
                            <UserAvatar
                                src={user?.avatar_path ?? null}
                                name={user?.name ?? user?.email}
                                className="h-8 w-8"
                            />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="truncate">
                            {user?.email}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => router.visit("/profile")}
                        >
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => router.post(route("logout"))}
                        >
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

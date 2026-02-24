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
        <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 border-b bg-background/90 backdrop-blur">
            <div className="h-full px-4 flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onOpenSidebar}
                    aria-label="Open sidebar"
                >
                    <Menu className="h-5 w-5" />
                </Button>

                <div className="font-semibold text-sm truncate">
                    CBT Jobsheet
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="rounded-full">
                            <UserAvatar
                                src={user?.avatar_path ?? null}
                                name={user?.name ?? user?.email}
                                className="h-9 w-9"
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

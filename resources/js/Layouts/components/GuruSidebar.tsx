import { router, usePage } from "@inertiajs/react";
import {
    LayoutDashboard,
    Users,
    BookOpen,
    ClipboardList,
    ClipboardCheck,
    FileQuestion,
    UserCircle2,
} from "lucide-react";

import SidebarItem from "./SidebarItem";
import SidebarSection from "./SidebarSection";
import { Button } from "@/Components/ui/button";
import { GraduationCap } from "lucide-react";

export default function GuruSidebar({
    onNavigate,
}: {
    onNavigate?: () => void;
}) {
    const page = usePage();
    const user = (page.props as any).auth?.user;

    return (
        <aside className="md:flex md:w-72 md:flex-col md:border-r md:bg-background">
            <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <GraduationCap className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">
                            {user?.profile?.full_name ?? user?.email ?? "Guru"}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">
                            {user?.role ?? "guru"}
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-[490px] overflow-auto">
                <nav className="flex-1 h-full py-2">
                    <div className="px-2 pt-2 space-y-1">
                        <SidebarItem
                            onClick={onNavigate}
                            href="/dashboard"
                            icon={<LayoutDashboard className="h-4 w-4" />}
                            activePathStartsWith="/dashboard"
                        >
                            Dashboard
                        </SidebarItem>

                        <SidebarItem
                            onClick={onNavigate}
                            href="/guru/students"
                            icon={<Users className="h-4 w-4" />}
                            activePathStartsWith="/guru/students"
                        >
                            Data Siswa
                        </SidebarItem>
                    </div>

                    <div className="border-b my-2" />

                    <SidebarSection>Materi</SidebarSection>
                    <div className="px-2 pt-2 space-y-1">
                        <SidebarItem
                            onClick={onNavigate}
                            href="/materi"
                            icon={<BookOpen className="h-4 w-4" />}
                            activePathStartsWith="/materi"
                        >
                            Materi
                        </SidebarItem>
                        <SidebarItem
                            onClick={onNavigate}
                            href="/practice-rules"
                            icon={<ClipboardList className="h-4 w-4" />}
                            activePathStartsWith="/practice-rules"
                        >
                            Rules Praktek
                        </SidebarItem>
                        <SidebarItem
                            onClick={onNavigate}
                            href="/practice-results"
                            icon={<ClipboardCheck className="h-4 w-4" />}
                            activePathStartsWith="/practice-results"
                        >
                            Hasil Praktek
                        </SidebarItem>
                    </div>

                    <div className="border-b my-2" />

                    <div className="px-2 pt-2 space-y-1">
                        <SidebarItem
                            onClick={onNavigate}
                            href="/tests"
                            icon={<FileQuestion className="h-4 w-4" />}
                            activePathStartsWith="/tests"
                        >
                            Test
                        </SidebarItem>
                    </div>
                </nav>
            </div>

            <div className="border-t p-2">
                <SidebarItem
                    onClick={onNavigate}
                    href="/profile"
                    icon={<UserCircle2 className="h-4 w-4" />}
                >
                    Profile
                </SidebarItem>

                <div className="px-2 pt-2">
                    <Button
                        onClick={() => router.post(route("logout"))}
                        variant="outline"
                        className="w-full"
                        type="submit"
                    >
                        Logout
                    </Button>
                </div>
            </div>
        </aside>
    );
}

import { router, usePage } from "@inertiajs/react";
import {
    BookOpen,
    ClipboardCheck,
    ClipboardList,
    GraduationCap,
    LayoutDashboard,
    Upload,
    UserCircle2,
} from "lucide-react";
import SidebarSection from "./SidebarSection";
import SidebarItem from "./SidebarItem";
import { Button } from "@/Components/ui/button";

export default function SiswaSidebar({
    onNavigate,
}: {
    onNavigate?: () => void;
}) {
    const page = usePage<any>();
    const user = page.props?.auth?.user;

    const displayName =
        user?.profile?.full_name || user?.name || user?.email || "Siswa";

    return (
        <aside className="md:flex md:w-72 md:flex-col md:border-r md:bg-background">
            <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <GraduationCap className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">
                            {displayName}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">
                            {user?.role ?? "siswa"}
                        </div>
                    </div>
                </div>
            </div>

            <div className="sm:h-[490px] h-[450px] overflow-auto">
                <nav className="flex-1 h-full py-2">
                    <div className="px-2 pt-2 space-y-1">
                        <SidebarItem
                            onClick={onNavigate}
                            href="/dashboard"
                            icon={<LayoutDashboard className="h-4 w-4" />}
                            activePathStartsWith="/siswa/dashboard"
                        >
                            Dashboard
                        </SidebarItem>
                    </div>

                    <SidebarSection>Belajar</SidebarSection>
                    <div className="px-2 pt-2 space-y-1">
                        <SidebarItem
                            onClick={onNavigate}
                            href="/pretest"
                            icon={<ClipboardList className="h-4 w-4" />}
                            activePathStartsWith="/pretest"
                        >
                            Pretest
                        </SidebarItem>

                        <SidebarItem
                            onClick={onNavigate}
                            href="/my-materi"
                            icon={<BookOpen className="h-4 w-4" />}
                            activePathStartsWith="/my-materi"
                        >
                            Materi
                        </SidebarItem>

                        <SidebarItem
                            onClick={onNavigate}
                            href="/posttest"
                            icon={<ClipboardCheck className="h-4 w-4" />}
                            activePathStartsWith="/posttest"
                        >
                            Posttest
                        </SidebarItem>
                    </div>

                    <div className="border-b my-2" />

                    <SidebarSection>Praktik</SidebarSection>
                    <div className="px-2 pt-2 space-y-1">
                        <SidebarItem
                            onClick={onNavigate}
                            href="/upload-practice"
                            icon={<Upload className="h-4 w-4" />}
                            activePathStartsWith="/upload-practice"
                        >
                            Upload Praktik
                        </SidebarItem>
                    </div>
                </nav>
            </div>

            <div className="border-t p-2">
                <SidebarItem
                    onClick={onNavigate}
                    href="/profile"
                    icon={<UserCircle2 className="h-4 w-4" />}
                    activePathStartsWith="/profile"
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

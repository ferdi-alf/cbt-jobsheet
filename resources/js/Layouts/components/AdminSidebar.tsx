import { router, usePage } from "@inertiajs/react";
import {
    BarChart3,
    BookOpen,
    ClipboardCheck,
    ClipboardList,
    FileQuestion,
    GraduationCap,
    Layers,
    LayoutDashboard,
    Plus,
    Table2,
    UserCircle2,
    Users,
} from "lucide-react";
import SidebarSection from "./SidebarSection";
import SidebarItem from "./SidebarItem";
import { Button } from "@/Components/ui/button";

export default function AdminSidebar({
    onNavigate,
}: {
    onNavigate?: () => void;
}) {
    const page = usePage();
    const user = (page.props as any).auth?.user;

    return (
        <aside className=" md:flex md:w-72 md:flex-col md:border-r md:bg-background">
            <div className="p-4 bg border-b">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <GraduationCap className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">
                            {user?.role === "admin"
                                ? (user?.email ?? "Admin")
                                : (user?.name ?? "User")}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">
                            {user?.role ?? "admin"}
                        </div>
                    </div>
                </div>
            </div>
            <div className="sm:overflow-clip overflow-auto mb-2 sm:mb-0 sm:h-auto h-[420px]  ">
                <nav className="flex-1 h-full   py-2">
                    <div className="px-2 pt-2 space-y-1">
                        <SidebarItem
                            onClick={onNavigate}
                            href="/dashboard"
                            icon={<LayoutDashboard className="h-4 w-4" />}
                            activePathStartsWith="/dashboard"
                        >
                            Dashboard
                        </SidebarItem>
                    </div>
                    <div className="px-2 pt-2 space-y-1">
                        <SidebarItem
                            onClick={onNavigate}
                            href="/users"
                            icon={<Users className="h-4 w-4" />}
                            activePathStartsWith="/users"
                        >
                            User
                        </SidebarItem>
                    </div>

                    <div className="px-2 pt-2 space-y-1">
                        <SidebarItem
                            onClick={onNavigate}
                            href="/kelas"
                            icon={<Layers className="h-4 w-4" />}
                            activePathStartsWith="/kelas"
                        >
                            Kelas
                        </SidebarItem>
                    </div>
                    <div className="px-2 pt-2 space-y-1">
                        <SidebarItem
                            onClick={onNavigate}
                            href="/mapels"
                            icon={<BookOpen className="h-4 w-4" />}
                            activePathStartsWith="/mapels"
                        >
                            Mapel
                        </SidebarItem>
                    </div>

                    <SidebarSection>Management Siswa</SidebarSection>
                    <div className="px-2 pt-2 space-y-1">
                        <SidebarItem
                            onClick={onNavigate}
                            href="/students/create"
                            icon={<Plus className="h-4 w-4" />}
                            activePathStartsWith="/students/create"
                        >
                            Tambah Siswa
                        </SidebarItem>
                        <SidebarItem
                            onClick={onNavigate}
                            href="/students/data"
                            icon={<Table2 className="h-4 w-4" />}
                            activePathStartsWith="/students/data"
                        >
                            Data Siswa
                        </SidebarItem>
                    </div>
                    <div className="border-b"></div>

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
                    <div className="border-b"></div>
                    <div className="px-2 pt-2 space-y-1 ">
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

            <div className="border-t  p-2">
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

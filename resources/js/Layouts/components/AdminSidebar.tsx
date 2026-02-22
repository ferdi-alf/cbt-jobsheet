import { usePage } from "@inertiajs/react";
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

export default function AdminSidebar() {
    const page = usePage();
    const user = (page.props as any).auth?.user;

    return (
        <aside className="hidden md:flex md:w-72 md:flex-col md:border-r md:bg-background">
            <div className="p-4 border b">
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

            <nav className="flex-1 overflow-auto py-2">
                <div className="px-2 pt-2 space-y-1">
                    <SidebarItem
                        href="/dashboard"
                        icon={<LayoutDashboard className="h-4 w-4" />}
                        activePathStartsWith="/dashboard"
                    >
                        Dashboard
                    </SidebarItem>
                </div>
                <div className="px-2 pt-2 space-y-1">
                    <SidebarItem
                        href="/users"
                        icon={<Users className="h-4 w-4" />}
                        activePathStartsWith="/admin/users"
                    >
                        User
                    </SidebarItem>
                </div>

                <div className="px-2 pt-2 space-y-1">
                    <SidebarItem
                        href="/admin/kelas"
                        icon={<Layers className="h-4 w-4" />}
                        activePathStartsWith="/admin/kelas"
                    >
                        Kelas
                    </SidebarItem>
                </div>

                <SidebarSection>Management Siswa</SidebarSection>
                <div className="px-2 pt-2 space-y-1">
                    <SidebarItem
                        href="/admin/students/create"
                        icon={<Plus className="h-4 w-4" />}
                        activePathStartsWith="/admin/students/create"
                    >
                        Tambah Siswa
                    </SidebarItem>
                    <SidebarItem
                        href="/admin/students"
                        icon={<Table2 className="h-4 w-4" />}
                        activePathStartsWith="/admin/students"
                    >
                        Data Siswa
                    </SidebarItem>
                </div>
                <div className="border-b"></div>

                <SidebarSection>Materi</SidebarSection>
                <div className="px-2 pt-2 space-y-1">
                    <SidebarItem
                        href="/admin/materi"
                        icon={<BookOpen className="h-4 w-4" />}
                        activePathStartsWith="/admin/materi"
                    >
                        Materi
                    </SidebarItem>
                    <SidebarItem
                        href="/admin/practice-rules"
                        icon={<ClipboardList className="h-4 w-4" />}
                        activePathStartsWith="/admin/practice-rules"
                    >
                        Rules Praktek
                    </SidebarItem>
                    <SidebarItem
                        href="/admin/practice-results"
                        icon={<ClipboardCheck className="h-4 w-4" />}
                        activePathStartsWith="/admin/practice-results"
                    >
                        Hasil Praktek
                    </SidebarItem>
                </div>
                <div className="border-b"></div>
                <div className="px-2 pt-2 space-y-1">
                    <SidebarItem
                        href="/admin/tests"
                        icon={<FileQuestion className="h-4 w-4" />}
                        activePathStartsWith="/admin/tests"
                    >
                        Test
                    </SidebarItem>
                </div>
                <div className="px-2 pt-2 space-y-1">
                    <SidebarItem
                        href="/admin/scores"
                        icon={<BarChart3 className="h-4 w-4" />}
                        activePathStartsWith="/admin/scores"
                    >
                        Nilai
                    </SidebarItem>
                </div>
            </nav>

            <div className="border-t p-2">
                <SidebarItem
                    href="/profile"
                    icon={<UserCircle2 className="h-4 w-4" />}
                >
                    Profile
                </SidebarItem>

                <div className="px-2 pt-2">
                    <form method="post" action={route("logout")}>
                        <Button
                            variant="outline"
                            className="w-full"
                            type="submit"
                        >
                            Logout
                        </Button>
                    </form>
                </div>
            </div>
        </aside>
    );
}

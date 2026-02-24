import { PropsWithChildren, useState } from "react";
import AdminSidebar from "./components/AdminSidebar";
import MobileSidebar from "./components/MobileSidebar";
import MobileTopbar from "./components/MobileTopBar";

export default function AdminLayout({ children }: PropsWithChildren) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen w-full bg-muted/30">
            <MobileTopbar onOpenSidebar={() => setSidebarOpen(true)} />

            <div className="flex min-h-screen w-full">
                <aside className="hidden md:flex md:w-72 md:flex-col md:border-r md:bg-background">
                    <AdminSidebar />
                </aside>

                <MobileSidebar
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                >
                    <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
                </MobileSidebar>

                <main className="flex-1 min-w-0 p-4 md:p-6 pt-16 md:pt-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

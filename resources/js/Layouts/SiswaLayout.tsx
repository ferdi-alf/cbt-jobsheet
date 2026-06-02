import { PropsWithChildren, useState } from "react";
import MobileSidebar from "./components/MobileSidebar";
import MobileTopbar from "./components/MobileTopBar";
import SiswaSidebar from "./components/SiswaSidebar";
import DesktopTopbar from "./components/DesktopTopbar";

export default function SiswaLayout({ children }: PropsWithChildren) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="h-screen overflow-hidden w-full bg-muted/30 flex flex-col">
            <DesktopTopbar />
            <MobileTopbar onOpenSidebar={() => setSidebarOpen(true)} />

            <div className="flex flex-1 min-h-0 w-full">
                <aside className="hidden md:flex md:w-72 md:flex-col md:border-r md:bg-background">
                    <SiswaSidebar />
                </aside>

                <MobileSidebar
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                >
                    <SiswaSidebar onNavigate={() => setSidebarOpen(false)} />
                </MobileSidebar>

                <main className="flex-1 overflow-auto min-w-0 p-4 md:p-6 pt-16 md:pt-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

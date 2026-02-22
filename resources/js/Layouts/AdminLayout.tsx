import { PropsWithChildren } from "react";
import { Toaster } from "sonner";
import AdminSidebar from "./components/AdminSidebar";

export default function AdminLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen w-full bg-muted/30">
            <div className="flex">
                <AdminSidebar />

                <main className="flex-1 p-4 md:p-6">{children}</main>
            </div>

            <Toaster position="top-right" />
        </div>
    );
}

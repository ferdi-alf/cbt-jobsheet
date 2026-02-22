import UserAvatar from "@/Components/common/UserAvatar";
import { DataTable } from "@/Components/data-table";
import { Button } from "@/Components/ui/button";

import UserViewDrawer from "@/features/users/components/UserViewDrawer";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head } from "@inertiajs/react";
import { Eye, Pencil, Trash2 } from "lucide-react";

type UserRow = {
    id: number;
    avatar_path: string | null;
    email: string;
    username: string | null;
    role: "admin" | "guru";
    created_at: string;
    guru?: {
        full_name: string;
        nip?: string;
        kelas?: string | null;
        mapel?: string | null;
    } | null;
};

export default function UsersIndex() {
    const columns = [
        {
            key: "avatar_path",
            label: "Avatar",
            render: (value: string | null, row: UserRow) => (
                <UserAvatar
                    src={value ?? null}
                    name={row.username ?? row.email}
                    className="h-10 w-10"
                />
            ),
        },
        { key: "email", label: "Email" },
        { key: "username", label: "Username" },
        { key: "role", label: "Role", align: "center" as const },
        {
            key: "guru",
            label: "Kelas/Mapel",
            render: (_: any, row: UserRow) => {
                if (row.role !== "guru") return "";
                return `${row.guru?.kelas ?? "-"} / ${row.guru?.mapel ?? "-"}`;
            },
        },
        { key: "created_at", label: "Created At" },
    ];

    const actions = (row: UserRow) => (
        <>
            <UserViewDrawer user={row}>
                <Button variant="ghost" size="icon" aria-label="View user">
                    <Eye className="h-4 w-4" />
                </Button>
            </UserViewDrawer>

            <Button variant="ghost" size="icon" aria-label="Edit user">
                <Pencil className="h-4 w-4" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                aria-label="Delete user"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </>
    );

    return (
        <AdminLayout>
            <Head title="Users" />
            <div className="overflow-hidden w-full">
                <DataTable
                    title="User Management"
                    fetchUrl="/api/users"
                    columns={columns as any}
                    actions={actions}
                    search={{
                        enabled: true,
                        placeholder: "Search email/usernamer/role...",
                        debounceMs: 300,
                    }}
                    pagination={{
                        enabled: true,
                        pageSize: 10,
                        pageSizeOptions: [5, 10, 15, 20],
                    }}
                    striped
                />
            </div>
        </AdminLayout>
    );
}

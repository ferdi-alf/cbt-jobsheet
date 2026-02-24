import { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head } from "@inertiajs/react";
import { Eye, Pencil, Trash2, Plus } from "lucide-react";

import UserAvatar from "@/Components/common/UserAvatar";
import DataTable from "@/Components/data-table/DataTable";
import { Button } from "@/Components/ui/button";

import type { UserRow } from "@/features/users/types";
import UserViewDrawer from "@/features/users/components/UserViewDrawer";
import UserFormDialog from "@/features/users/components/UserFormDialog";
import DeleteUserDialog from "@/features/users/components/DeleteUserDialog";
import { Badge } from "@/Components/ui/badge";

export default function UsersIndex() {
    const [reloadKey, setReloadKey] = useState(0);
    const reload = () => setReloadKey((k) => k + 1);

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
        {
            key: "role",
            label: "Role",
            align: "center" as const,
            render: (role: string) => {
                return <Badge variant="outline">{role}</Badge>;
            },
        },
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
            <UserViewDrawer
                userId={row.id}
                trigger={
                    <Button variant="ghost" size="icon" aria-label="View user">
                        <Eye className="h-4 w-4" />
                    </Button>
                }
            />

            <UserFormDialog
                mode="edit"
                initial={row}
                onSuccess={reload}
                trigger={
                    <Button variant="ghost" size="icon" aria-label="Edit user">
                        <Pencil className="h-4 w-4" />
                    </Button>
                }
            />

            <DeleteUserDialog
                userId={row.id}
                label={row.username ?? row.email}
                onSuccess={reload}
                trigger={
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        aria-label="Delete user"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                }
            />
        </>
    );

    return (
        <AdminLayout>
            <Head title="Users" />

            <div className="bg-background border rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="text-lg font-semibold">User Management</div>

                    <UserFormDialog
                        mode="create"
                        onSuccess={reload}
                        trigger={
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah User
                            </Button>
                        }
                    />
                </div>

                <DataTable<UserRow>
                    key={reloadKey}
                    fetchUrl="/api/users"
                    columns={columns}
                    actions={actions}
                    search={{
                        enabled: true,
                        placeholder: "Search email/username/role...",
                        debounceMs: 300,
                    }}
                    pagination={{
                        enabled: true,
                        pageSize: 10,
                        pageSizeOptions: [5, 10, 15, 20],
                    }}
                    striped
                    emptyMessage="Belum ada user."
                />
            </div>
        </AdminLayout>
    );
}

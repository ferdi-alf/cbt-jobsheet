import GuruLayout from "@/Layouts/GuruLayout";
import { Head } from "@inertiajs/react";
import { DataTable } from "@/Components/data-table";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Eye } from "lucide-react";
import UserAvatar from "@/Components/common/UserAvatar";

import type { StudentRow } from "@/features/students/types";
import StudentViewDrawer from "@/features/students/components/StudentViewDrawer";

export default function GuruStudentsIndex() {
    const columns = [
        {
            key: "avatar_path",
            label: "Avatar",
            render: (value: string | null, row: StudentRow) => (
                <UserAvatar
                    src={value ?? null}
                    name={row.full_name ?? row.email}
                    className="h-10 w-10"
                />
            ),
        },
        { key: "full_name", label: "Nama Lengkap" },
        { key: "kelas", label: "Kelas" },
        { key: "email", label: "Email" },
        {
            key: "avg_posttest",
            label: "Avg Posttest",
            align: "center" as const,
            render: (v: number) => <Badge variant="secondary">{v}</Badge>,
        },
        { key: "created_at", label: "Created At" },
    ];

    const actions = (row: StudentRow) => {
        return (
            <StudentViewDrawer
                studentId={row.id}
                title={`Detail Siswa: ${row.full_name}`}
                trigger={
                    <Button variant="ghost" size="icon" aria-label="View siswa">
                        <Eye className="h-4 w-4" />
                    </Button>
                }
            />
        );
    };

    return (
        <GuruLayout>
            <Head title="Data Siswa" />

            <div className="bg-background border rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-xl font-semibold">Data Siswa</div>
                </div>

                <DataTable<StudentRow>
                    fetchUrl="/api/students"
                    columns={columns as any}
                    actions={actions}
                    search={{
                        enabled: true,
                        placeholder: "Cari nama/email...",
                        debounceMs: 300,
                    }}
                    pagination={{
                        enabled: true,
                        pageSize: 10,
                        pageSizeOptions: [5, 10, 15, 20],
                    }}
                    striped
                    emptyMessage="Belum ada siswa."
                />
            </div>
        </GuruLayout>
    );
}

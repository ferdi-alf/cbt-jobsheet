import AdminLayout from "@/Layouts/AdminLayout";
import { Head } from "@inertiajs/react";
import { DataTable } from "@/Components/data-table";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Eye, Pencil, Trash2, Plus } from "lucide-react";

import type { KelasRow } from "@/features/kelas/types";
import KelasFormDialog from "@/features/kelas/components/KelasFormDialog";
import DeleteKelasDialog from "@/features/kelas/components/DeleteKelasDialog";
import KelasViewDrawer from "@/features/kelas/components/KelasViewDrawer";
import KelasStudentsTable from "@/features/kelas/components/KelasStudentsTable";

export default function KelasIndex() {
    const columns = [
        { key: "name", label: "Nama Kelas" },
        {
            key: "total_students",
            label: "Total Siswa",
            align: "center" as const,
            render: (v: number) => <Badge variant="secondary">{v}</Badge>,
        },
        {
            key: "total_guru",
            label: "Guru Handle",
            align: "center" as const,
            render: (v: number) => <Badge variant="outline">{v}</Badge>,
        },
        { key: "created_at", label: "Created At" },
    ];

    const actions = (row: KelasRow) => {
        const disableDelete = row.total_students > 0 || row.total_guru > 0;
        return (
            <>
                <KelasViewDrawer
                    kelasId={row.id}
                    title={`Detail Kelas: ${row.name}`}
                    trigger={
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="View kelas"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                    }
                />

                <KelasFormDialog
                    initial={{ id: row.id, name: row.name }}
                    trigger={
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Edit kelas"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                    }
                />

                <DeleteKelasDialog
                    kelasId={row.id}
                    kelasName={row.name}
                    trigger={
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            disabled={disableDelete}
                            aria-label="Delete kelas"
                            title={
                                disableDelete
                                    ? "Tidak bisa hapus: masih ada siswa/guru"
                                    : "Hapus"
                            }
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    }
                />
            </>
        );
    };

    return (
        <AdminLayout>
            <Head title="Kelas" />

            <div className="bg-background border rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-xl font-semibold">
                        Management Kelas
                    </div>

                    <KelasFormDialog
                        trigger={
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah Kelas
                            </Button>
                        }
                    />
                </div>

                <DataTable<KelasRow>
                    fetchUrl="/api/kelas"
                    columns={columns as any}
                    actions={actions}
                    search={{
                        enabled: true,
                        placeholder: "Search kelas...",
                        debounceMs: 300,
                    }}
                    pagination={{
                        enabled: true,
                        pageSize: 10,
                        pageSizeOptions: [5, 10, 15, 20],
                    }}
                    striped
                    expandable={{
                        condition: (row) => row.total_students > 0,
                        render: (_subData, row) => (
                            <div className="p-2">
                                <KelasStudentsTable kelasId={row.id} />
                            </div>
                        ),
                    }}
                />
            </div>
        </AdminLayout>
    );
}

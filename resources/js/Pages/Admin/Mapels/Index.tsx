import AdminLayout from "@/Layouts/AdminLayout";
import { Head } from "@inertiajs/react";
import { DataTable } from "@/Components/data-table";
import { Button } from "@/Components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { MapelRow } from "@/features/mapel/types";
import DeleteMapelDialog from "@/features/mapel/components/DeleteMapelDialog";
import MapelFormDialog from "@/features/mapel/components/MapelFormDialog";
import MapelGurusTable from "@/features/mapel/components/MapelGurusTable";

export default function MapelsIndex() {
    const [refreshKey, setRefreshKey] = useState(0);

    const refetch = () => setRefreshKey((v) => v + 1);

    const columns = [
        { key: "name", label: "Nama Mapel" },
        { key: "total_guru", label: "Total Guru", align: "center" as const },
        {
            key: "total_materi",
            label: "Total Materi",
            align: "center" as const,
        },
        { key: "created_at", label: "Created At" },
    ];

    const actions = (row: MapelRow) => (
        <>
            <MapelFormDialog
                initial={{ id: row.id, name: row.name }}
                onDone={refetch}
                trigger={
                    <Button variant="ghost" size="icon" aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                    </Button>
                }
            />

            <DeleteMapelDialog
                mapelId={row.id}
                mapelName={row.name}
                onDone={refetch}
                disabled={
                    (row.total_guru ?? 0) > 0 || (row.total_materi ?? 0) > 0
                }
                trigger={
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        aria-label="Delete"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                }
            />
        </>
    );

    return (
        <AdminLayout>
            <Head title="Mapel" />

            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold">Management Mapel</h1>

                <MapelFormDialog
                    onDone={refetch}
                    trigger={
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Mapel
                        </Button>
                    }
                />
            </div>

            <div className="bg-background border rounded-xl shadow-sm p-4">
                <DataTable<MapelRow>
                    key={refreshKey}
                    title="Daftar Mapel"
                    fetchUrl="/api/mapels"
                    columns={columns as any}
                    actions={actions}
                    search={{
                        enabled: true,
                        placeholder: "Cari mapel...",
                        debounceMs: 300,
                    }}
                    pagination={{
                        enabled: true,
                        pageSize: 10,
                        pageSizeOptions: [5, 10, 15, 20],
                    }}
                    striped
                    expandable={{
                        condition: (row) => (row.total_guru ?? 0) > 0,
                        render: (_sub, row) => (
                            <MapelGurusTable mapelId={row.id} />
                        ),
                    }}
                />
            </div>
        </AdminLayout>
    );
}

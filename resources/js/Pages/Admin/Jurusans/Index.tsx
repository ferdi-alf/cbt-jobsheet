import AdminLayout from "@/Layouts/AdminLayout";
import { Head } from "@inertiajs/react";
import { DataTable } from "@/Components/data-table";
import { Button } from "@/Components/ui/button";
import { Pencil, Trash2, Plus } from "lucide-react";
import JurusanFormDialog from "@/features/jurusan/components/JurusanFormDialog";
import DeleteJurusanDialog from "@/features/jurusan/components/DeleteJurusanDialog";
import { JurusanRow } from "@/features/jurusan/type";

export default function JurusansIndex() {
    const columns = [
        {
            key: "logo_url",
            label: "Logo",
            align: "left" as const,
            width: "80px",
            render: (_: any, row: JurusanRow) =>
                row.logo_url ? (
                    <img
                        src={row.logo_url}
                        alt={row.name}
                        className="h-9 w-9 object-contain mx-auto rounded-md"
                    />
                ) : (
                    <div className="h-9 w-9 rounded bg-muted mx-auto flex items-center justify-center text-muted-foreground text-xs">
                        N/A
                    </div>
                ),
        },
        { key: "name", label: "Nama Jurusan" },
    ];

    const actions = (row: JurusanRow) => (
        <>
            <JurusanFormDialog
                initial={{ id: row.id, name: row.name, logo_url: row.logo_url }}
                trigger={
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Edit jurusan"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                }
            />
            <DeleteJurusanDialog
                jurusanId={row.id}
                jurusanName={row.name}
                trigger={
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        aria-label="Hapus jurusan"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                }
            />
        </>
    );

    return (
        <AdminLayout>
            <Head title="Jurusan" />

            <div className="bg-background border rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-end mb-4">
                    <JurusanFormDialog
                        trigger={
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah Jurusan
                            </Button>
                        }
                    />
                </div>

                <DataTable<JurusanRow>
                    fetchUrl="/api/jurusans"
                    columns={columns as any}
                    actions={actions}
                    search={{
                        enabled: true,
                        placeholder: "Cari nama jurusan...",
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

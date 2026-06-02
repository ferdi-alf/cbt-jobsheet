import AdminLayout from "@/Layouts/AdminLayout";
import GuruLayout from "@/Layouts/GuruLayout";
import { Head, usePage } from "@inertiajs/react";
import DataTable from "@/Components/data-table/DataTable";
import { Button } from "@/Components/ui/button";
import {
    Eye,
    Pencil,
    Trash2,
    Download,
    FileText,
    Plus,
    Archive,
} from "lucide-react";

import type { MateriRow } from "@/features/materi/types";
import MateriViewDrawer from "@/features/materi/components/MateriViewDrawer";
import MateriFormDialog from "@/features/materi/components/MateriFormDialog";
import DeleteMateriDialog from "@/features/materi/components/DeleteMateriDialog";

export default function MateriIndex() {
    const { props } = usePage<any>();
    const role = props.auth?.user?.role as string | undefined;
    const isAdmin = role === "admin";
    const isGuru = role === "guru";
    const isPetugas = isAdmin || isGuru;

    const Layout = isAdmin ? AdminLayout : GuruLayout;

    const columns = [
        {
            key: "title",
            label: "Materi",
            render: (_v: any, row: MateriRow) => (
                <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-red-600 shrink-0" />
                    <span className="font-medium truncate">{row.title}</span>
                </div>
            ),
        },
        {
            key: "mapel",
            label: "Mapel - Fase",
            render: (_v: any, row: MateriRow) => (
                <span>{`${row.mapel} - ${row.fase}`}</span>
            ),
        },
        { key: "kelas", label: "Kelas" },
        {
            key: "created_by",
            label: "Dibuat Oleh",
            render: (v: any) => v?.name ?? v?.email ?? v ?? "-",
        },
        { key: "created_at", label: "Created At" },
    ];

    const actions = (row: MateriRow) => (
        <>
            <MateriViewDrawer
                materiId={row.id}
                title={`Detail Materi: ${row.title}`}
                trigger={
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="View materi"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                }
            />

            <Button
                variant="ghost"
                size="icon"
                aria-label="Download materi"
                disabled={!row.download_url}
                onClick={() =>
                    row.download_url && window.open(row.download_url, "_blank")
                }
            >
                <Download className="h-4 w-4" />
            </Button>

            {isPetugas && (
                <MateriFormDialog
                    mode="edit"
                    materiId={row.id}
                    trigger={
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Edit materi"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                    }
                />
            )}

            {isPetugas && (
                <DeleteMateriDialog
                    materiId={row.id}
                    materiTitle={row.title}
                    trigger={
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            aria-label="Delete materi"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    }
                />
            )}
        </>
    );

    return (
        <Layout>
            <Head title="Materi" />

            <div className="bg-background border rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="text-xl font-semibold">Materi</div>

                    {isPetugas && (
                        <MateriFormDialog
                            mode="create"
                            trigger={
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Upload Materi
                                </Button>
                            }
                        />
                    )}
                </div>

                <DataTable<MateriRow>
                    fetchUrl="/api/materis"
                    columns={columns as any}
                    actions={actions}
                    search={{
                        enabled: true,
                        placeholder: "Cari judul...",
                        debounceMs: 300,
                    }}
                    pagination={{
                        enabled: true,
                        pageSize: 10,
                        pageSizeOptions: [5, 10, 15, 20],
                    }}
                    striped
                    expandable={{
                        condition: (row) =>
                            !!(
                                row.praktik_text?.trim() ||
                                row.k3_alat_bahan?.trim() ||
                                row.elemen?.trim() ||
                                row.tujuan_pembelajaran?.trim()
                            ),
                        render: (_sub, row) => (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-1">
                                {row.elemen?.trim() && (
                                    <div className="rounded-md border p-3 bg-background">
                                        <div className="text-sm font-semibold mb-1">
                                            Elemen
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {row.elemen}
                                        </div>
                                    </div>
                                )}
                                {row.tujuan_pembelajaran?.trim() && (
                                    <div className="rounded-md border p-3 bg-background">
                                        <div className="text-sm font-semibold mb-1">
                                            Tujuan Pembelajaran
                                        </div>
                                        <div className="text-sm text-muted-foreground whitespace-pre-line">
                                            {row.tujuan_pembelajaran}
                                        </div>
                                    </div>
                                )}
                                {row.praktik_text?.trim() && (
                                    <div className="rounded-md border p-3 bg-background">
                                        <div className="text-sm font-semibold mb-1">
                                            Deskripsi Praktik
                                        </div>
                                        <div className="text-sm text-muted-foreground whitespace-pre-line">
                                            {row.praktik_text}
                                        </div>
                                    </div>
                                )}
                                {row.k3_alat_bahan?.trim() && (
                                    <div className="rounded-md border p-3 bg-background">
                                        <div className="text-sm font-semibold mb-1">
                                            K3 dan APD
                                        </div>
                                        <div className="text-sm text-muted-foreground whitespace-pre-line">
                                            {row.k3_alat_bahan}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ),
                    }}
                    emptyMessage="Belum ada materi."
                />
            </div>
        </Layout>
    );
}

import AdminLayout from "@/Layouts/AdminLayout";
import GuruLayout from "@/Layouts/GuruLayout";
import { Head, usePage } from "@inertiajs/react";
import { DataTable } from "@/Components/data-table";
import { Button } from "@/Components/ui/button";
import { Eye, Pencil, Trash2, Plus, FileText } from "lucide-react";
import type { TestRow } from "@/features/tests/types";
import TestViewDrawer from "@/features/tests/components/TestViewDrawer";
import TestFormDrawer from "@/features/tests/components/TestFormDrawer";
import DeleteTestDialog from "@/features/tests/components/DeleteTestDialog";
import TestQuestionsExpandable from "@/features/tests/components/TestQuestionsExpandable";
import { Badge } from "@/Components/ui/badge";

export default function TestsIndex() {
    const { props } = usePage<any>();
    const role = props.auth?.user?.role;
    const isAdmin = role === "admin";
    const Layout = isAdmin ? AdminLayout : GuruLayout;

    const columns = [
        {
            key: "title",
            label: "Judul",
            render: (_: any, row: TestRow) => (
                <div className="min-w-0">
                    <div className="font-medium truncate">{row.title}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4 text-red-600" />
                        <span className="truncate">
                            {row.materi?.title ?? "-"}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            key: "type",
            label: "Type",
            align: "left" as const,
            render: (v: any) => <Badge variant="outline">{String(v)}</Badge>,
        },
        {
            key: "duration_minutes",
            label: "Durasi",
            align: "center" as const,
            render: (v: any) => `${Number(v ?? 0)} mnt`,
        },
        {
            key: "is_score_visible",
            label: "Nilai",
            align: "center" as const,
            render: (v: any) => (
                <Badge variant={v ? "default" : "secondary"}>
                    {v ? "Tampil" : "Tidak"}
                </Badge>
            ),
        },
        {
            key: "created_by",
            label: "Dibuat Oleh",
            render: (_: any, row: TestRow) => {
                const cb = row.created_by;
                if (!cb) return "-";

                const display =
                    (role === "guru"
                        ? cb.full_name || cb.name || cb.email
                        : cb.name || cb.email) ?? "-";

                return <span className="truncate">{display}</span>;
            },
        },
        { key: "created_at", label: "Created At" },
    ];

    const actions = (row: TestRow) => (
        <>
            <TestViewDrawer
                testId={row.id}
                title={`Detail Test: ${row.title}`}
                trigger={
                    <Button variant="ghost" size="icon" aria-label="View test">
                        <Eye className="h-4 w-4" />
                    </Button>
                }
            />

            <TestFormDrawer
                mode="edit"
                testId={row.id}
                trigger={
                    <Button variant="ghost" size="icon" aria-label="Edit test">
                        <Pencil className="h-4 w-4" />
                    </Button>
                }
            />

            <DeleteTestDialog
                testId={row.id}
                label={row.title}
                onSuccess={() => {}}
                trigger={
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        aria-label="Delete test"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                }
            />
        </>
    );

    return (
        <Layout>
            <Head title="Tests" />

            <div className="bg-background border rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="text-xl font-semibold">Tests</div>

                    <TestFormDrawer
                        mode="create"
                        trigger={
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah Test
                            </Button>
                        }
                    />
                </div>

                <DataTable<TestRow>
                    fetchUrl="/api/tests"
                    columns={columns as any}
                    actions={actions}
                    search={{
                        enabled: true,
                        placeholder: "Cari judul/materi/type...",
                        debounceMs: 300,
                    }}
                    pagination={{
                        enabled: true,
                        pageSize: 10,
                        pageSizeOptions: [5, 10, 15, 20],
                    }}
                    striped
                    expandable={{
                        condition: (row) => true,
                        render: (_sub: any, row: TestRow) => (
                            <TestQuestionsExpandable testId={row.id} />
                        ),
                    }}
                    emptyMessage="Belum ada test."
                />
            </div>
        </Layout>
    );
}

import AdminLayout from "@/Layouts/AdminLayout";
import GuruLayout from "@/Layouts/GuruLayout";
import { Head, usePage } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { DataTable } from "@/Components/data-table";
import { Badge } from "@/Components/ui/badge";
import { Eye, Pencil, Trash2, Plus, FileText } from "lucide-react";

import type { PracticeRuleRow } from "@/features/practice-rules/types";
import PracticeRuleViewDrawer from "@/features/practice-rules/components/PracticeRuleViewDrawer";
import PracticeRuleFormDrawer from "@/features/practice-rules/components/PracticeRuleFormDrawer";
import DeletePracticeRuleDialog from "@/features/practice-rules/components/DeletePracticeRuleDialog";

export default function PracticeRulesIndex() {
    const { props } = usePage<any>();
    const role = props.auth?.user?.role;
    const isAdmin = role === "admin";

    const Layout = isAdmin ? AdminLayout : GuruLayout;

    const columns = [
        { key: "title", label: "Judul" },
        {
            key: "materi",
            label: "Materi",
            render: (_v: any, row: PracticeRuleRow) => (
                <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-red-600 shrink-0" />
                    <span className="truncate font-medium">
                        {row.materi?.title ?? "-"}
                    </span>
                </div>
            ),
        },
        {
            key: "kelas_mapel",
            label: "Kelas/Mapel",
            render: (_v: any, row: PracticeRuleRow) => (
                <div className="text-sm">
                    <div className="font-medium">{row.kelas ?? "-"}</div>
                    <div className="text-muted-foreground">
                        {row.mapel ?? "-"}
                    </div>
                </div>
            ),
        },
        {
            key: "deadline_at",
            label: "Deadline",
            render: (v: string | null) =>
                v ? (
                    <Badge variant="outline">{v}</Badge>
                ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                ),
        },
        {
            key: "total_checklists",
            label: "Checklist",
            align: "center" as const,
            render: (v: number) => <Badge variant="secondary">{v ?? 0}</Badge>,
        },
        {
            key: "created_by",
            label: "Dibuat Oleh",
            render: (_v: any, row: PracticeRuleRow) => (
                <div className="text-sm">
                    <div className="font-medium">
                        {row.created_by?.name ?? "-"}
                    </div>
                    <div className="text-muted-foreground">
                        {row.created_by?.email ?? ""}
                    </div>
                </div>
            ),
        },
        { key: "created_at", label: "Created At" },
    ];

    const actions = (row: PracticeRuleRow) => (
        <>
            <PracticeRuleViewDrawer
                ruleId={row.id}
                title={`Detail Praktek: ${row.title}`}
                trigger={
                    <Button variant="ghost" size="icon" aria-label="View">
                        <Eye className="h-4 w-4" />
                    </Button>
                }
            />

            <PracticeRuleFormDrawer
                mode="edit"
                ruleId={row.id}
                trigger={
                    <Button variant="ghost" size="icon" aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                    </Button>
                }
            />

            <DeletePracticeRuleDialog
                ruleId={row.id}
                label={row.title}
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
        <Layout>
            <Head title="Rules Praktek" />

            <div className="bg-background border rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="text-xl font-semibold">Rules Praktek</div>

                    <PracticeRuleFormDrawer
                        mode="create"
                        trigger={
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah Rule
                            </Button>
                        }
                    />
                </div>

                <DataTable<PracticeRuleRow>
                    fetchUrl="/api/practice-rules"
                    columns={columns as any}
                    actions={actions}
                    search={{
                        enabled: true,
                        placeholder: "Cari judul/materi...",
                        debounceMs: 300,
                    }}
                    pagination={{
                        enabled: true,
                        pageSize: 10,
                        pageSizeOptions: [5, 10, 15, 20],
                    }}
                    striped
                    expandable={{
                        condition: (row) => (row.total_checklists ?? 0) > 0,
                        render: (_sub, row) => (
                            <div className="space-y-2">
                                <div className="text-sm font-semibold">
                                    Checklist
                                </div>
                                <DataTable<any>
                                    fetchUrl={`/api/practice-rules/${row.id}/checklists`}
                                    columns={
                                        [
                                            {
                                                key: "order",
                                                label: "#",
                                                align: "center" as const,
                                            },
                                            { key: "title", label: "Item" },
                                        ] as any
                                    }
                                    pagination={{
                                        enabled: true,
                                        pageSize: 10,
                                        pageSizeOptions: [5, 10, 20],
                                    }}
                                    search={{
                                        enabled: true,
                                        placeholder: "Cari checklist...",
                                        debounceMs: 250,
                                    }}
                                    striped
                                    emptyMessage="Belum ada checklist."
                                />
                            </div>
                        ),
                    }}
                    emptyMessage="Belum ada rule praktek."
                />
            </div>
        </Layout>
    );
}

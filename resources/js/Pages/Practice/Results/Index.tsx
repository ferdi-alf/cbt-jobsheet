import { useEffect, useMemo, useState, useCallback } from "react";
import { Head, usePage } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import DataTable from "@/Components/data-table/DataTable";
import AdminLayout from "@/Layouts/AdminLayout";
import GuruLayout from "@/Layouts/GuruLayout";
import { ClipboardCheck } from "lucide-react";
import type {
    PracticeResultFilter,
    PracticeResultRow,
} from "@/features/practice-results/types";
import { usePracticeResultSummary } from "@/features/practice-results/hooks/usePracticeResultSummary";
import PracticeResultsFilterBar from "@/features/practice-results/components/PracticeResultsFilterBar";
import PracticeResultExpandable from "@/features/practice-results/components/PracticeResultExpandable";
import PracticeResultViewDrawer from "@/features/practice-results/components/PracticeResultViewDrawer";
import { useQueryClient } from "@tanstack/react-query";

function fmt(value?: string | null) {
    if (!value) return "-";
    try {
        return new Intl.DateTimeFormat("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(new Date(value));
    } catch {
        return value;
    }
}

export default function PracticeResultsIndex() {
    const { props } = usePage<any>();
    const role = props.auth?.user?.role;
    const Layout = role === "admin" ? AdminLayout : GuruLayout;

    const qc = useQueryClient();
    const summary = usePracticeResultSummary();
    const [filter, setFilter] = useState<PracticeResultFilter>("all");
    const [ready, setReady] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (!summary.data || ready) return;
        setFilter(summary.data.pending_count > 0 ? "pending" : "all");
        setReady(true);
    }, [summary.data, ready]);

    const fetchUrl = useMemo(() => {
        const q = new URLSearchParams();
        q.set("filter", filter);
        return `/api/practice-results?${q.toString()}`;
    }, [filter]);

    const handleGradingSuccess = useCallback(async () => {
        await Promise.all([
            qc.invalidateQueries({
                queryKey: ["practice-results-summary"],
            }),
            qc.invalidateQueries({
                predicate: (query) =>
                    Array.isArray(query.queryKey) &&
                    query.queryKey[0] === "table-data" &&
                    typeof query.queryKey[1] === "string" &&
                    query.queryKey[1].includes("/api/practice-results"),
            }),
        ]);

        await summary.refetch();

        if (filter === "pending") {
            const latest = await qc
                .ensureQueryData({
                    queryKey: ["practice-results-summary"],
                    queryFn: summary.refetch as any,
                })
                .catch(() => null);

            const pendingCount =
                (latest as any)?.pending_count ?? summary.data?.pending_count ?? 0;

            if (pendingCount <= 0) {
                setFilter("all");
            }
        }

        setRefreshKey((v) => v + 1);
    }, [qc, summary, filter]);

    const columns = [
        {
            key: "student_name",
            label: "Siswa",
            render: (_: any, row: PracticeResultRow) => (
                <div className="min-w-0">
                    <div className="font-medium truncate">
                        {row.student_name}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                        {row.materi_title ?? "-"}
                    </div>
                </div>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (v: PracticeResultRow["status"]) => (
                <Badge variant={v === "graded" ? "default" : "secondary"}>
                    {v === "graded"
                        ? "Sudah dinilai"
                        : "Dikumpulkan - belum dinilai"}
                </Badge>
            ),
        },
        {
            key: "submitted_at",
            label: "Submitted At",
            render: (v: string | null) => fmt(v),
        },
        {
            key: "total_score",
            label: "Total Score",
            align: "center" as const,
            render: (v: number | null) => (v === null ? "-" : v),
        },
    ];

    const actions = (row: PracticeResultRow) => (
        <PracticeResultViewDrawer
            submissionId={row.id}
            title={`Nilai Praktek: ${row.student_name}`}
            onGraded={handleGradingSuccess}
            trigger={
                <Button variant="ghost" size="icon" aria-label="Nilai praktek">
                    <ClipboardCheck className="h-4 w-4" />
                </Button>
            }
        />
    );

    return (
        <Layout>
            <Head title="Hasil Praktek" />

            <div className="rounded-xl border bg-background p-4 shadow-sm space-y-4">
                {summary.isLoading || !summary.data || !ready ? (
                    <div className="text-sm text-muted-foreground">
                        Memuat filter...
                    </div>
                ) : (
                    <PracticeResultsFilterBar
                        filter={filter}
                        summary={summary.data}
                        onChange={setFilter}
                    />
                )}

                {summary.isError && (
                    <div className="text-sm text-destructive">
                        {summary.error?.message ??
                            "Gagal memuat ringkasan hasil praktek."}
                    </div>
                )}

                {ready && summary.data && (
                    <DataTable<PracticeResultRow>
                        key={`${fetchUrl}-${refreshKey}`}
                        fetchUrl={fetchUrl}
                        columns={columns as any}
                        actions={actions}
                        search={{
                            enabled: true,
                            placeholder: "Cari siswa atau materi...",
                            debounceMs: 300,
                        }}
                        pagination={{
                            enabled: true,
                            pageSize: 10,
                            pageSizeOptions: [5, 10, 15, 20],
                        }}
                        striped
                        expandable={{
                            condition: (row) => row.status === "graded",
                            render: (_sub, row) => (
                                <PracticeResultExpandable row={row} />
                            ),
                        }}
                        emptyMessage="Belum ada hasil praktek."
                    />
                )}
            </div>
        </Layout>
    );
}

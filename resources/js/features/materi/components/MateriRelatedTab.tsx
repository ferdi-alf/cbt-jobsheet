import DataTable from "@/Components/data-table/DataTable";
import { Badge } from "@/Components/ui/badge";
import MateriTopStudentsBarChart from "./MateriTopStudentsChart";

type PracticeResultRow = {
    id: number;
    full_name: string;
    status: "draft" | "submitted" | "graded";
    total_score: number | null;
    graded_by_label: string | null;
    submitted_at?: string | null;
    graded_at?: string | null;
    feedback?: string | null;
};

type TestResultRow = {
    id: number;
    full_name: string;
    title: string;
    duration_seconds?: number | null;
    score?: number | null;
    submitted_at?: string | null;
    created_at?: string | null;
    correct: number;
    wrong: number;
};

function fmtDuration(v?: number | null) {
    if (!v) return "-";
    const minutes = Math.floor(v / 60);
    const seconds = v % 60;
    return `${minutes}m ${seconds}s`;
}

export default function MateriRelatedTab({ materiId }: { materiId: number }) {
    return (
        <div className="space-y-4">
            <MateriTopStudentsBarChart materiId={materiId} />

            <div className="rounded-xl border p-4">
                <div className="mb-2 font-semibold">Hasil Praktik</div>
                <DataTable<PracticeResultRow>
                    fetchUrl={`/api/materis/${materiId}/practice-results`}
                    columns={
                        [
                            { key: "full_name", label: "Nama Lengkap" },
                            {
                                key: "status",
                                label: "Status",
                                render: (v: any, row: PracticeResultRow) => {
                                    if (row.status === "graded") {
                                        return <Badge>Sudah dinilai</Badge>;
                                    }
                                    if (row.status === "submitted") {
                                        return (
                                            <Badge variant="secondary">
                                                Dikumpulkan - belum dinilai
                                            </Badge>
                                        );
                                    }
                                    return (
                                        <Badge variant="outline">Draft</Badge>
                                    );
                                },
                            },
                            {
                                key: "total_score",
                                label: "Nilai",
                                render: (v: any) => v ?? "-",
                            },
                            {
                                key: "graded_by_label",
                                label: "Dinilai Oleh",
                                render: (v: any) => v ?? "-",
                            },
                            {
                                key: "submitted_at",
                                label: "Submitted At",
                            },
                            {
                                key: "graded_at",
                                label: "Graded At",
                                render: (v: any) => v ?? "-",
                            },
                        ] as any
                    }
                    search={{
                        enabled: true,
                        placeholder: "Cari nama siswa...",
                        debounceMs: 300,
                    }}
                    pagination={{
                        enabled: true,
                        pageSize: 10,
                        pageSizeOptions: [5, 10, 15, 20],
                    }}
                    striped
                    expandable={{
                        condition: (row) => !!row.feedback,
                        render: (_sub, row) => (
                            <div className="rounded-lg border bg-background p-3">
                                <div className="mb-1 text-sm font-semibold">
                                    Feedback
                                </div>
                                <div className="text-sm text-muted-foreground whitespace-pre-line">
                                    {row.feedback || "-"}
                                </div>
                            </div>
                        ),
                    }}
                    emptyMessage="Belum ada hasil praktik."
                />
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <div className="rounded-xl border p-4">
                    <div className="mb-2 font-semibold">Hasil Pretest</div>
                    <DataTable<TestResultRow>
                        fetchUrl={`/api/materis/${materiId}/test-attempts?type=pretest`}
                        columns={
                            [
                                { key: "full_name", label: "Nama Lengkap" },
                                { key: "title", label: "Judul Test" },
                                {
                                    key: "duration_seconds",
                                    label: "Lama Waktu",
                                    render: (v: any) =>
                                        fmtDuration(Number(v ?? 0)),
                                },
                                {
                                    key: "score",
                                    label: "Nilai",
                                    render: (v: any) => v ?? "-",
                                },
                                { key: "submitted_at", label: "Dikerjakan" },
                                {
                                    key: "correct",
                                    label: "Benar / Salah",
                                    render: (_: any, row: TestResultRow) => (
                                        <div className="flex flex-wrap gap-2">
                                            <Badge>{row.correct}</Badge>
                                            <Badge variant="destructive">
                                                {row.wrong}
                                            </Badge>
                                        </div>
                                    ),
                                },
                            ] as any
                        }
                        search={{
                            enabled: true,
                            placeholder: "Cari siswa...",
                            debounceMs: 300,
                        }}
                        pagination={{
                            enabled: true,
                            pageSize: 10,
                            pageSizeOptions: [5, 10, 15, 20],
                        }}
                        striped
                        emptyMessage="Belum ada hasil pretest."
                    />
                </div>

                <div className="rounded-xl border p-4">
                    <div className="mb-2 font-semibold">Hasil Posttest</div>
                    <DataTable<TestResultRow>
                        fetchUrl={`/api/materis/${materiId}/test-attempts?type=posttest`}
                        columns={
                            [
                                { key: "full_name", label: "Nama Lengkap" },
                                { key: "title", label: "Judul Test" },
                                {
                                    key: "duration_seconds",
                                    label: "Lama Waktu",
                                    render: (v: any) =>
                                        fmtDuration(Number(v ?? 0)),
                                },
                                {
                                    key: "score",
                                    label: "Nilai",
                                    render: (v: any) => v ?? "-",
                                },
                                { key: "submitted_at", label: "Dikerjakan" },
                                {
                                    key: "correct",
                                    label: "Benar / Salah",
                                    render: (_: any, row: TestResultRow) => (
                                        <div className="flex flex-wrap gap-2">
                                            <Badge>{row.correct}</Badge>
                                            <Badge variant="destructive">
                                                {row.wrong}
                                            </Badge>
                                        </div>
                                    ),
                                },
                            ] as any
                        }
                        search={{
                            enabled: true,
                            placeholder: "Cari siswa...",
                            debounceMs: 300,
                        }}
                        pagination={{
                            enabled: true,
                            pageSize: 10,
                            pageSizeOptions: [5, 10, 15, 20],
                        }}
                        striped
                        emptyMessage="Belum ada hasil posttest."
                    />
                </div>
            </div>
        </div>
    );
}

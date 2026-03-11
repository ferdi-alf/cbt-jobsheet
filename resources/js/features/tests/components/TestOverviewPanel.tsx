import { useQuery } from "@tanstack/react-query";
import { getTestOverview } from "../api/tests.api";
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { DataTable } from "@/Components/data-table";
import type { TestAttemptRow } from "../types";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

function secondsToMinutes(sec?: number) {
    const s = Number(sec ?? 0);
    return Math.round(s / 60);
}

export default function TestOverviewPanel({ testId }: { testId: number }) {
    const q = useQuery({
        queryKey: ["test-overview", testId],
        queryFn: () => getTestOverview(testId),
        staleTime: 60_000,
    });

    if (q.isLoading) return <div className="text-sm">Loading...</div>;
    if (q.isError)
        return (
            <div className="text-sm text-destructive">
                {(q.error as Error)?.message ?? "Error"}
            </div>
        );
    const data = q.data!;

    const attemptColumns = [
        { key: "name", label: "Nama" },
        { key: "kelas", label: "Kelas" },
        {
            key: "duration_seconds",
            label: "Waktu",
            align: "center" as const,
            render: (v: any) => `${secondsToMinutes(v)} menit`,
        },
        {
            key: "score",
            label: "Nilai",
            align: "center" as const,
            render: (v: any) => (
                <Badge variant="secondary">{Number(v ?? 0)}</Badge>
            ),
        },
        {
            key: "correct",
            label: "Benar-Salah",
            align: "center" as const,
            render: (_: any, row: TestAttemptRow) => (
                <div className="flex items-center justify-center gap-2">
                    <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                        {row.correct}
                    </Badge>
                    <span className="text-muted-foreground">-</span>
                    <Badge className="bg-red-600 text-white hover:bg-red-600">
                        {row.wrong}
                    </Badge>
                </div>
            ),
        },
    ];

    const pieColors = ["#2563eb", "#ef4444"];

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <div className="text-lg font-semibold">{data.title}</div>
                <div className="text-sm text-muted-foreground">
                    <div className="text-sm text-muted-foreground space-y-1">
                        <div>
                            {data.materi?.title ?? "-"} •{" "}
                            {data.materi?.kelas ?? "-"} /{" "}
                            {data.materi?.mapel ?? "-"}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <span>
                                <b>Dibuat oleh:</b>{" "}
                                {(data.created_by?.full_name ??
                                data.created_by?.name)
                                    ? data.created_by.name
                                    : data.created_by?.role}
                            </span>
                            <span>
                                <b>Start:</b> {data.start_at ?? "-"}
                            </span>
                            <span>
                                <b>End:</b> {data.end_at ?? "-"}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                    <Badge variant="outline">{data.type}</Badge>
                    <Badge variant="outline">
                        {data.duration_minutes} menit
                    </Badge>
                    <Badge
                        variant={
                            data.is_score_visible ? "default" : "secondary"
                        }
                    >
                        Nilai{" "}
                        {data.is_score_visible ? "Tampil" : "Disembunyikan"}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground">
                            Total Soal
                        </div>
                        <div className="text-2xl font-semibold">
                            {data.stats.total_questions}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground">
                            Total Pengerjaan
                        </div>
                        <div className="text-2xl font-semibold">
                            {data.stats.total_attempts}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <Card>
                    <CardContent className="p-4">
                        <div className="font-semibold mb-2">Top 5 Nilai</div>
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.top5 ?? []}>
                                    <XAxis dataKey="name" hide />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar fill="#3b82f6" dataKey="score" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                            (Bar chart) 5 nilai tertinggi.
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="font-semibold mb-2">
                            Distribusi Nilai
                        </div>
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.pie ?? []}
                                        dataKey="value"
                                        nameKey="label"
                                        outerRadius={90}
                                        label
                                    >
                                        {(data.pie ?? []).map((_, idx) => (
                                            <Cell
                                                key={idx}
                                                fill={
                                                    pieColors[
                                                        idx % pieColors.length
                                                    ]
                                                }
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                            (Pie) &gt;=80 vs &lt;80.
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-xl border bg-background p-3">
                <div className="font-semibold mb-2">
                    Siswa yang sudah mengerjakan
                </div>
                <DataTable<TestAttemptRow>
                    fetchUrl={`/api/tests/${testId}/attempts`}
                    columns={attemptColumns as any}
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
                    emptyMessage="Belum ada yang mengerjakan."
                />
            </div>
        </div>
    );
}

import { ReactNode, useMemo } from "react";
import EntityDrawer from "@/Components/drawers/EntityDrawer";
import { Badge } from "@/Components/ui/badge";
import { DataTable } from "@/Components/data-table";

import type { PracticeRuleDetail, RuleStats } from "../types";
import { getPracticeRule, getRuleStats } from "../api/practiceRules.api";

type DrawerData = {
    rule: PracticeRuleDetail;
    stats: RuleStats;
};

export default function PracticeRuleViewDrawer({
    ruleId,
    title,
    trigger,
}: {
    ruleId: number;
    title: string;
    trigger: ReactNode;
}) {
    return (
        <EntityDrawer<DrawerData>
            variant="bottom"
            title={title}
            trigger={trigger}
            id={ruleId}
            fetcher={async (id) => {
                const rid = Number(id);
                const [rule, stats] = await Promise.all([
                    getPracticeRule(rid),
                    getRuleStats(rid),
                ]);
                return { rule, stats };
            }}
            cacheKey={(id) => ["practice-rule-view", Number(id)]}
            render={({ data, loading, error }) => {
                if (loading) return <div className="text-sm">Loading...</div>;
                if (error)
                    return (
                        <div className="text-sm text-destructive">{error}</div>
                    );
                if (!data)
                    return (
                        <div className="text-sm text-muted-foreground">
                            No data
                        </div>
                    );

                return <PracticeRuleViewContent ruleId={ruleId} data={data} />;
            }}
        />
    );
}

function PracticeRuleViewContent({
    ruleId,
    data,
}: {
    ruleId: number;
    data: DrawerData;
}) {
    const { rule, stats } = data;

    const cards = useMemo(
        () => [
            { label: "Total Siswa", value: stats.total_students },
            { label: "Sudah", value: stats.submitted },
            { label: "Belum", value: stats.not_submitted },
            { label: "Checklist", value: rule.total_checklists },
        ],
        [stats, rule],
    );

    return (
        <div className="space-y-4">
            {/* header */}
            <div className="space-y-1">
                <div className="text-lg font-semibold">{rule.title}</div>
                <div className="text-sm text-muted-foreground">
                    Materi: <b>{rule.materi?.title ?? "-"}</b> —{" "}
                    {rule.kelas ?? "-"} / {rule.mapel ?? "-"}
                </div>
                {rule.deadline_at ? (
                    <div className="text-sm">
                        Deadline:{" "}
                        <Badge variant="outline">{rule.deadline_at}</Badge>
                    </div>
                ) : (
                    <div className="text-sm text-muted-foreground">
                        Deadline: -
                    </div>
                )}
            </div>

            {/* stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {cards.map((c) => (
                    <div key={c.label} className="rounded-xl border p-3">
                        <div className="text-xs text-muted-foreground">
                            {c.label}
                        </div>
                        <div className="text-2xl font-semibold">
                            {c.value ?? 0}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-xl border p-3">
                    <div className="font-semibold mb-2">Ringkasan</div>
                    <div className="space-y-2 text-sm">
                        {stats.chart.map((it) => (
                            <div
                                key={it.label}
                                className="flex items-center justify-between"
                            >
                                <div>{it.label}</div>
                                <Badge variant="secondary">
                                    {it.value ?? 0}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-xl border p-3">
                    <div className="font-semibold mb-2">
                        Belum mengerjakan ({stats.not_submitted_students.length}
                        )
                    </div>
                    <div className="h-48 overflow-auto space-y-2">
                        {stats.not_submitted_students.length ? (
                            stats.not_submitted_students.map((s) => (
                                <div
                                    key={s.id}
                                    className="flex items-center justify-between text-sm border-b pb-2"
                                >
                                    <div className="min-w-0">
                                        <div className="truncate font-medium">
                                            {s.name}
                                        </div>
                                        {s.nisn ? (
                                            <div className="text-xs text-muted-foreground">
                                                NISN: {s.nisn}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-muted-foreground">
                                Semua siswa sudah mengerjakan 🎉
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* table sudah ngerjain */}
            <div className="rounded-xl border p-3">
                <div className="font-semibold mb-3">Sudah mengerjakan</div>

                <DataTable<any>
                    fetchUrl={`/api/practice-rules/${ruleId}/submissions`}
                    columns={
                        [
                            { key: "name", label: "Nama" },
                            { key: "nisn", label: "NISN" },
                            {
                                key: "submitted_at",
                                label: "Submitted At",
                            },
                            {
                                key: "is_late",
                                label: "Late",
                                align: "center" as const,
                                render: (v: boolean) =>
                                    v ? (
                                        <Badge variant="destructive">
                                            Late
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary">
                                            On time
                                        </Badge>
                                    ),
                            },
                            {
                                key: "total_score",
                                label: "Score",
                                align: "center" as const,
                            },
                        ] as any
                    }
                    search={{
                        enabled: true,
                        placeholder: "Cari nama/nisn...",
                        debounceMs: 250,
                    }}
                    pagination={{
                        enabled: true,
                        pageSize: 10,
                        pageSizeOptions: [5, 10, 20],
                    }}
                    striped
                    emptyMessage="Belum ada siswa yang submit."
                />
            </div>
        </div>
    );
}

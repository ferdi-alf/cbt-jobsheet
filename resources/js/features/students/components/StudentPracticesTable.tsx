import { DataTable } from "@/Components/data-table";
import type {
    PracticeRow,
    PracticeItemRow,
} from "../api/studentsPractices.api";
import { getPracticeItems } from "../api/studentsPractices.api";
import { Badge } from "@/Components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

export default function StudentPracticesTable({
    studentId,
}: {
    studentId: number;
}) {
    const columns = [
        { key: "materi_title", label: "Materi" },
        { key: "status", label: "Status" },
        {
            key: "is_late",
            label: "Late",
            align: "center" as const,
            render: (v: boolean) => (
                <Badge variant={v ? "destructive" : "secondary"}>
                    {v ? "Ya" : "Tidak"}
                </Badge>
            ),
        },
        {
            key: "total_score",
            label: "Score",
            align: "center" as const,
            render: (v: number | null) => (
                <Badge variant="outline">{v ?? 0}</Badge>
            ),
        },
        { key: "submitted_at", label: "Submitted At" },
    ];

    return (
        <DataTable<PracticeRow, PracticeItemRow[]>
            fetchUrl={`/api/students/${studentId}/practices`}
            columns={columns as any}
            search={{
                enabled: true,
                placeholder: "Cari materi...",
                debounceMs: 300,
            }}
            pagination={{
                enabled: true,
                pageSize: 10,
                pageSizeOptions: [5, 10, 15, 20],
            }}
            striped
            emptyMessage="Belum ada submission praktek."
            expandable={{
                condition: () => true,
                fetchUrl: (row) => `/api/practice-submissions/${row.id}/items`,
                transform: (res: any) => res, // karena api wrapper kamu return data langsung (api.get)
                render: (subData, row, loading, error) => {
                    if (loading)
                        return (
                            <div className="text-sm text-muted-foreground">
                                Loading checklist...
                            </div>
                        );
                    if (error)
                        return (
                            <div className="text-sm text-destructive">
                                {error}
                            </div>
                        );

                    const items = (subData ?? []) as any[];

                    if (items.length === 0)
                        return (
                            <div className="text-sm text-muted-foreground">
                                Tidak ada checklist.
                            </div>
                        );

                    return (
                        <div className="space-y-2">
                            {items.map((it: any) => (
                                <div
                                    key={it.id}
                                    className="rounded-md border bg-background p-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="font-medium truncate">
                                                {it.title}
                                            </div>
                                            {it.note ? (
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    Catatan: {it.note}
                                                </div>
                                            ) : null}
                                        </div>

                                        <div className="shrink-0">
                                            {it.has_photo ? (
                                                <CheckCircle2 className="h-5 w-5" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </div>
                                    </div>

                                    {it.photos?.length ? (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {it.photos.map((ph: any) => (
                                                <a
                                                    key={ph.id}
                                                    href={ph.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="block"
                                                >
                                                    <img
                                                        src={ph.url}
                                                        alt="photo"
                                                        className="h-16 w-16 rounded object-cover border"
                                                    />
                                                </a>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    );
                },
            }}
        />
    );
}

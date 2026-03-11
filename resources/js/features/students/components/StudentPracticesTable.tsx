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
        {
            key: "submitted_at",
            label: "Submitted At",
            align: "center" as const,
        },
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
        />
    );
}

import { DataTable } from "@/Components/data-table";
import type { TestQuestionRow } from "../types";
import { Badge } from "@/Components/ui/badge";

export default function TestQuestionsExpandable({
    testId,
}: {
    testId: number;
}) {
    const columns = [
        { key: "order", label: "#", align: "center" as const },
        { key: "question", label: "Soal" },
        {
            key: "correct_option",
            label: "Benar",
            align: "center" as const,
            render: (v: string) => (
                <Badge variant="secondary">{String(v).toUpperCase()}</Badge>
            ),
        },
    ];

    return (
        <div className="rounded-lg border bg-background p-3">
            <div className="font-semibold mb-2">Soal & Kunci Jawaban</div>

            <DataTable<TestQuestionRow>
                fetchUrl={`/api/tests/${testId}/questions`}
                columns={columns as any}
                search={{
                    enabled: true,
                    placeholder: "Cari soal...",
                    debounceMs: 300,
                }}
                pagination={{
                    enabled: true,
                    pageSize: 5,
                    pageSizeOptions: [5, 10, 20],
                }}
                striped
                emptyMessage="Belum ada soal."
                expandable={{
                    condition: (row) => !!row.question,
                    render: (_sub: any, row: TestQuestionRow) => (
                        <div className="grid gap-2 text-sm">
                            <div className="font-medium">Opsi</div>
                            <div className="grid gap-1">
                                {(["a", "b", "c", "d", "e"] as const).map(
                                    (k) => (
                                        <div
                                            key={k}
                                            className="flex items-start gap-2"
                                        >
                                            <Badge
                                                variant={
                                                    row.correct_option === k
                                                        ? "default"
                                                        : "outline"
                                                }
                                            >
                                                {k.toUpperCase()}
                                            </Badge>
                                            <div className="text-muted-foreground whitespace-pre-line">
                                                {row.options[k]}
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>
                    ),
                }}
            />
        </div>
    );
}

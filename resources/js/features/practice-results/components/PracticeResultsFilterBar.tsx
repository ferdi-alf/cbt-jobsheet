import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import type { PracticeResultFilter, PracticeResultSummary } from "../types";

export default function PracticeResultsFilterBar({
    filter,
    summary,
    onChange,
}: {
    filter: PracticeResultFilter;
    summary: PracticeResultSummary;
    onChange: (next: PracticeResultFilter) => void;
}) {
    const items: Array<{
        key: PracticeResultFilter;
        label: string;
        count: number;
    }> = [
        {
            key: "pending",
            label: "Belum dinilai",
            count: summary.pending_count,
        },
        { key: "graded", label: "Sudah dinilai", count: summary.graded_count },
        { key: "all", label: "Semua", count: summary.total_count },
    ];

    return (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-lg font-semibold">Hasil Praktek</div>
            <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                    <Button
                        key={item.key}
                        variant={filter === item.key ? "default" : "outline"}
                        onClick={() => onChange(item.key)}
                    >
                        {item.label}
                        <Badge
                            variant={
                                filter === item.key ? "secondary" : "outline"
                            }
                            className="ml-2"
                        >
                            {item.count}
                        </Badge>
                    </Button>
                ))}
            </div>
        </div>
    );
}

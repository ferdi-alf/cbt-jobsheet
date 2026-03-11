import type { PracticeResultRow } from "../types";

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

export default function PracticeResultExpandable({
    row,
}: {
    row: PracticeResultRow;
}) {
    return (
        <div className="rounded-xl border bg-background p-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <Info label="Nama siswa" value={row.student_name} />
                <Info label="Dinilai oleh" value={row.graded_by ?? "-"} />
                <Info label="Nilai" value={row.total_score ?? "-"} />
                <Info label="Waktu dinilai" value={fmt(row.graded_at)} />
            </div>

            {row.feedback?.trim() && (
                <div className="mt-3 rounded-lg border p-3 text-sm text-muted-foreground whitespace-pre-line">
                    {row.feedback}
                </div>
            )}
        </div>
    );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="mt-1 font-medium">{value}</div>
        </div>
    );
}

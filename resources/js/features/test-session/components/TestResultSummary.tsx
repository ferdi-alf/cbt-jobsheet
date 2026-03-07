import { router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import {
    CheckCircle2,
    Clock3,
    FileQuestion,
    CircleOff,
    ShieldCheck,
    Trophy,
} from "lucide-react";
import { clearTestSnapshot } from "../hooks/useTestStorage";
import { formatSeconds } from "../hooks/useTestTimer";
import { useTestResult } from "../hooks/useTestResult";

function StatItem({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border bg-background/80 p-4 text-center shadow-sm backdrop-blur-sm">
            <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                {icon}
            </div>
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="mt-1 text-xl font-semibold">{value}</div>
        </div>
    );
}

export default function TestResultSummary({
    publicKey,
}: {
    publicKey: string;
}) {
    const q = useTestResult(publicKey);

    if (q.isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="rounded-3xl border bg-background px-6 py-4 shadow-sm">
                    Memuat hasil test...
                </div>
            </div>
        );
    }

    if (q.isError || !q.data) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="rounded-3xl border bg-background px-6 py-4 shadow-sm text-destructive">
                    {q.error?.message ?? "Gagal memuat hasil test."}
                </div>
            </div>
        );
    }

    const data = q.data;
    clearTestSnapshot(publicKey);

    return (
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.10),transparent_28%),linear-gradient(to_bottom,rgba(248,250,252,0.96),rgba(255,255,255,1))] dark:bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_28%),linear-gradient(to_bottom,rgba(2,6,23,1),rgba(3,7,18,1))]">
            <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
                <div className="rounded-[32px] border bg-background/90 p-6 shadow-sm backdrop-blur-sm md:p-8">
                    <div className="flex flex-col items-center text-center">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-14 w-14" />
                        </div>

                        <div className="mt-5 text-2xl font-semibold md:text-3xl">
                            Test berhasil dikirim
                        </div>
                        <div className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                            Jawaban Anda untuk{" "}
                            <b className="text-foreground">{data.title}</b>{" "}
                            sudah tersimpan.
                        </div>
                    </div>

                    {data.is_score_visible && data.score !== null ? (
                        <div className="mt-6 rounded-3xl border border-emerald-500/30 bg-emerald-50 p-6 text-center dark:bg-emerald-950/20">
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                <Trophy className="h-4 w-4" />
                                Nilai ditampilkan
                            </div>
                            <div className="text-4xl font-bold text-emerald-700 dark:text-emerald-300 md:text-5xl">
                                {data.score}
                            </div>
                        </div>
                    ) : (
                        <div className="mt-6 rounded-3xl border bg-muted/30 p-5 text-center text-sm text-muted-foreground">
                            Nilai belum ditampilkan untuk test ini.
                        </div>
                    )}

                    <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
                        <StatItem
                            icon={<Clock3 className="h-5 w-5" />}
                            label="Waktu"
                            value={formatSeconds(data.duration_seconds)}
                        />
                        <StatItem
                            icon={<FileQuestion className="h-5 w-5" />}
                            label="Total soal"
                            value={data.total_questions}
                        />
                        <StatItem
                            icon={<ShieldCheck className="h-5 w-5" />}
                            label="Terjawab"
                            value={data.answered_count}
                        />
                        <StatItem
                            icon={<CheckCircle2 className="h-5 w-5" />}
                            label="Benar"
                            value={data.correct_count}
                        />
                        <StatItem
                            icon={<CircleOff className="h-5 w-5" />}
                            label="Kosong"
                            value={data.unanswered_count}
                        />
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Button onClick={() => router.visit(data.back_url)}>
                            Kembali ke halaman {data.back_label}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

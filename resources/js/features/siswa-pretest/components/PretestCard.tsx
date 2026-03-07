import { router } from "@inertiajs/react";
import { cn } from "@/lib/utils";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import {
    BookOpen,
    CalendarClock,
    CheckCircle2,
    FileQuestion,
    GraduationCap,
    PlayCircle,
    Timer,
    Trophy,
} from "lucide-react";
import type { PretestCardItem } from "../types";
import TestStartDialog from "@/features/test-session/components/TestStartDialog";

function formatDT(value?: string | null) {
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

function InfoPill({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border bg-muted/30 px-3 py-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {icon}
                <span>{label}</span>
            </div>
            <div className="mt-1 text-sm font-medium">{value}</div>
        </div>
    );
}

function ActionArea({ item }: { item: PretestCardItem }) {
    const availability = item.availability_status;

    if (availability === "submitted") {
        return (
            <Button
                variant="outline"
                onClick={() => router.visit(item.result_url)}
            >
                Lihat hasil
            </Button>
        );
    }

    if (availability === "in_progress") {
        return (
            <TestStartDialog
                item={item}
                mode="resume"
                trigger={<Button>Lanjutkan pengerjaan</Button>}
            />
        );
    }

    if (availability === "available") {
        return (
            <TestStartDialog
                item={item}
                mode="start"
                trigger={<Button>Mulai pretest</Button>}
            />
        );
    }

    if (availability === "upcoming") {
        return (
            <Button disabled variant="outline">
                Belum dimulai
            </Button>
        );
    }

    return (
        <Button disabled variant="outline">
            Sudah berakhir
        </Button>
    );
}

export default function PretestCard({ item }: { item: PretestCardItem }) {
    const availability = item.availability_status;

    const badge =
        availability === "submitted"
            ? {
                  text: "Selesai",
                  className: "bg-emerald-500 text-white border-emerald-500",
                  icon: <CheckCircle2 className="h-4 w-4" />,
              }
            : availability === "in_progress"
              ? {
                    text: "Berjalan",
                    className: "bg-amber-500 text-white border-amber-500",
                    icon: <PlayCircle className="h-4 w-4" />,
                }
              : availability === "upcoming"
                ? {
                      text: "Belum dimulai",
                      className: "border-border bg-muted text-muted-foreground",
                      icon: null,
                  }
                : availability === "expired"
                  ? {
                        text: "Sudah berakhir",
                        className:
                            "border-border bg-muted text-muted-foreground",
                        icon: null,
                    }
                  : {
                        text: "Siap dikerjakan",
                        className:
                            "bg-primary text-primary-foreground border-primary",
                        icon: <PlayCircle className="h-4 w-4" />,
                    };

    return (
        <div className="group relative overflow-hidden rounded-[28px] border bg-background p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/80 via-primary/40 to-transparent" />
            <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex size-12 min-h-12 min-w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <FileQuestion className="h-6 w-6" />
                        </div>

                        <div className="min-w-0">
                            <div className="text-lg font-semibold leading-6 md:text-xl md:leading-7">
                                {item.title}
                            </div>
                            <div className="mt-1 truncate text-sm text-muted-foreground">
                                {item.materi?.title ?? "Pretest"}
                            </div>
                        </div>
                    </div>

                    <Badge className={cn("shrink-0 border", badge.className)}>
                        <span className="inline-flex items-center gap-2">
                            {badge.icon}
                            {badge.text}
                        </span>
                    </Badge>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <InfoPill
                        icon={<BookOpen className="h-3.5 w-3.5" />}
                        label="Mapel"
                        value={item.materi?.mapel ?? "-"}
                    />
                    <InfoPill
                        icon={<GraduationCap className="h-3.5 w-3.5" />}
                        label="Kelas"
                        value={item.materi?.kelas ?? "-"}
                    />
                    <InfoPill
                        icon={<Timer className="h-3.5 w-3.5" />}
                        label="Durasi"
                        value={`${item.duration_minutes} menit`}
                    />
                    <InfoPill
                        icon={<CalendarClock className="h-3.5 w-3.5" />}
                        label="Jadwal"
                        value={`${formatDT(item.start_at)} → ${formatDT(item.end_at)}`}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>
                        Total soal:{" "}
                        <b className="text-foreground">
                            {item.total_questions}
                        </b>
                    </span>

                    {item.attempt?.status === "finished" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Sudah dikerjakan
                        </span>
                    )}

                    {item.is_score_visible && item.attempt?.score !== null && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-primary">
                            <Trophy className="h-3.5 w-3.5" />
                            Nilai: {item?.attempt?.score ?? "Tidak ada nilai"}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-end">
                    <ActionArea item={item} />
                </div>
            </div>
        </div>
    );
}

import type { ReactNode } from "react";
import { router } from "@inertiajs/react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/Components/ui/alert-dialog";
import { Badge } from "@/Components/ui/badge";
import {
    BookOpen,
    CalendarClock,
    FileQuestion,
    PlayCircle,
    RotateCcw,
    Timer,
} from "lucide-react";

type AvailabilityStatus =
    | "available"
    | "in_progress"
    | "submitted"
    | "upcoming"
    | "expired";

type LegacyStatus = "not_started" | "in_progress" | "submitted";

type TestStartDialogItem = {
    title: string;
    duration_minutes: number;
    total_questions: number;
    entry_url: string;
    start_at?: string | null;
    end_at?: string | null;
    materi?: {
        title?: string | null;
    } | null;
    availability_status?: AvailabilityStatus;
    status?: LegacyStatus;
};

type Props = {
    item: TestStartDialogItem;
    trigger: ReactNode;
    mode?: "start" | "resume";
    isResume?: boolean;
};

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

export default function TestStartDialog({
    item,
    trigger,
    mode,
    isResume,
}: Props) {
    const resume =
        Boolean(isResume) ||
        mode === "resume" ||
        item.availability_status === "in_progress" ||
        item.status === "in_progress";

    const heading = resume
        ? "Lanjutkan pengerjaan test?"
        : "Mulai test sekarang?";

    const actionLabel = resume ? "Lanjutkan" : "Mulai";

    const description = resume
        ? "Progress sebelumnya akan dilanjutkan. Pastikan koneksi stabil sebelum masuk kembali ke sesi test."
        : "Pastikan koneksi stabil. Setelah dimulai, timer akan berjalan dan jawaban akan disimpan otomatis agar aman saat refresh atau keluar tidak sengaja.";

    const goToTest = () => {
        router.visit(item.entry_url);
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

            <AlertDialogContent className="sm:max-w-lg">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        {resume ? (
                            <RotateCcw className="h-5 w-5" />
                        ) : (
                            <PlayCircle className="h-5 w-5" />
                        )}
                        <span>{heading}</span>
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="rounded-2xl border bg-muted/30 p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <FileQuestion className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                            <div className="font-semibold leading-6">
                                {item.title}
                            </div>

                            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                <BookOpen className="h-4 w-4 shrink-0" />
                                <span className="truncate">
                                    {item.materi?.title ?? "Test"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant="outline" className="gap-1.5">
                            <Timer className="h-3.5 w-3.5" />
                            {item.duration_minutes} menit
                        </Badge>

                        <Badge variant="secondary">
                            Soal: {item.total_questions}
                        </Badge>
                    </div>

                    <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
                        <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>
                            {formatDT(item.start_at)} → {formatDT(item.end_at)}
                        </span>
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={goToTest}>
                        {actionLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

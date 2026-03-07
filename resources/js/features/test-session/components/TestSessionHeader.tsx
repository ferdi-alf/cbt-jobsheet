import { Progress } from "@/Components/ui/progress";
import { Badge } from "@/Components/ui/badge";
import { BookOpen, Clock3, GraduationCap, Timer } from "lucide-react";
import { formatSeconds } from "../hooks/useTestTimer";
import type { TestSessionData } from "../types";

export default function TestSessionHeader({
    session,
    answeredCount,
    currentIndex,
    remainingSeconds,
    progressValue,
}: {
    session: TestSessionData;
    answeredCount: number;
    currentIndex: number;
    remainingSeconds: number;
    progressValue: number;
}) {
    return (
        <div className="sticky top-0 z-20 overflow-hidden rounded-[28px] border bg-background/90 p-4 shadow-sm backdrop-blur md:p-5">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative space-y-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                        <div className="text-xl font-semibold md:text-2xl">
                            {session.title}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                            {session.materi?.title ?? "Test"}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                            <Badge variant="outline" className="shrink-0">
                                <BookOpen className="mr-1 h-3.5 w-3.5" />
                                {session.materi?.mapel ?? "-"}
                            </Badge>
                            <Badge variant="outline" className="shrink-0">
                                <GraduationCap className="mr-1 h-3.5 w-3.5" />
                                {session.materi?.kelas ?? "-"}
                            </Badge>
                            <Badge variant="outline" className="shrink-0">
                                <Timer className="mr-1 h-3.5 w-3.5" />
                                {session.duration_minutes} menit
                            </Badge>
                        </div>
                    </div>

                    <div className="rounded-2xl border bg-background px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock3 className="h-4 w-4" />
                            Sisa waktu
                        </div>
                        <div className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
                            {formatSeconds(remainingSeconds)}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <div className="rounded-2xl border bg-background p-3 shadow-sm">
                        <div className="text-xs text-muted-foreground">
                            Soal aktif
                        </div>
                        <div className="mt-1 text-lg font-semibold">
                            {currentIndex + 1} / {session.total_questions}
                        </div>
                    </div>
                    <div className="rounded-2xl border bg-background p-3 shadow-sm">
                        <div className="text-xs text-muted-foreground">
                            Terjawab
                        </div>
                        <div className="mt-1 text-lg font-semibold">
                            {answeredCount}
                        </div>
                    </div>
                    <div className="rounded-2xl border bg-background p-3 shadow-sm">
                        <div className="text-xs text-muted-foreground">
                            Belum dijawab
                        </div>
                        <div className="mt-1 text-lg font-semibold">
                            {Math.max(
                                0,
                                session.total_questions - answeredCount,
                            )}
                        </div>
                    </div>
                    <div className="rounded-2xl border bg-background p-3 shadow-sm">
                        <div className="text-xs text-muted-foreground">
                            Progress
                        </div>
                        <div className="mt-1 text-lg font-semibold">
                            {progressValue}%
                        </div>
                    </div>
                </div>

                <Progress value={progressValue} className="h-2" />
            </div>
        </div>
    );
}

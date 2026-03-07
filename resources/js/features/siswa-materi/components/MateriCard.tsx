import { cn } from "@/lib/utils";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { FileText, LockKeyhole, CalendarClock } from "lucide-react";
import type { SiswaMateriItem } from "../types";

export default function MateriCard({ item }: { item: SiswaMateriItem }) {
    const locked = !!item.is_locked;
    const dl = item.pdf?.download_url ?? null;

    const openPdf = () => {
        if (!dl || locked) return;
        window.open(dl, "_blank");
    };

    return (
        <div
            className={cn(
                "rounded-xl border bg-background p-4 transition",
                locked ? "opacity-60" : "hover:bg-muted/30",
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <FileText className="h-5 w-5 text-red-600" />
                    </div>

                    <div className="min-w-0">
                        <div className="font-semibold truncate">
                            {item.title}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                            {item.kelas ?? "-"} / {item.mapel ?? "-"}
                        </div>
                    </div>
                </div>

                {locked ? (
                    <Badge variant="secondary" className="shrink-0">
                        <span className="inline-flex items-center gap-2">
                            <LockKeyhole className="h-4 w-4" />
                            Terkunci
                        </span>
                    </Badge>
                ) : (
                    <Badge variant="outline" className="shrink-0">
                        Terbuka
                    </Badge>
                )}
            </div>

            <div className="mt-3 text-sm text-muted-foreground space-y-1">
                {locked && (
                    <div>
                        <b className="text-foreground">Info:</b>{" "}
                        {item.lock_reason ?? "Kerjakan pretest dulu"}
                    </div>
                )}

                {item.pretest && (
                    <div className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4" />
                        <span className="truncate">
                            Pretest: {item.pretest.title} • Deadline:{" "}
                            {item.pretest.deadline_at ?? "-"}
                        </span>
                    </div>
                )}
            </div>

            <div className="mt-4 flex justify-end">
                <Button onClick={openPdf} disabled={locked || !dl}>
                    Buka Materi (PDF)
                </Button>
            </div>
        </div>
    );
}

import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import {
    BookOpen,
    CheckCircle2,
    ClipboardCheck,
    GraduationCap,
    Lock,
} from "lucide-react";
import type { SiswaMateriListItem } from "../types";
import SiswaMateriDrawer from "./SiswaMateriDrawer";

function StatusBadge({ item }: { item: SiswaMateriListItem }) {
    if (!item.can_open) {
        return (
            <Badge variant="secondary" className="gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                Terkunci
            </Badge>
        );
    }

    if (item.practice_status === "graded") {
        return (
            <Badge className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Sudah dinilai
            </Badge>
        );
    }

    if (item.practice_status === "submitted") {
        return <Badge className="gap-1.5">Sudah dikumpulkan</Badge>;
    }

    if (item.practice_status === "draft") {
        return <Badge variant="outline">Draft praktek</Badge>;
    }

    return <Badge variant="outline">Siap dibuka</Badge>;
}

export default function SiswaMateriCard({
    item,
}: {
    item: SiswaMateriListItem;
}) {
    const trigger = (
        <Button disabled={!item.can_open} className="w-full sm:w-auto">
            {item.can_open ? "Buka materi" : item.availability_label}
        </Button>
    );

    return (
        <div className="group relative overflow-hidden rounded-[28px] border bg-background p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/80 via-primary/40 to-transparent" />
            <div className="relative space-y-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-lg font-semibold leading-6">
                                {item.title}
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                {item.praktik_text_preview ||
                                    item.practice_title ||
                                    "Materi pembelajaran"}
                            </div>
                        </div>
                    </div>

                    <StatusBadge item={item} />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border bg-muted/30 px-3 py-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <GraduationCap className="h-3.5 w-3.5" />
                            Kelas
                        </div>
                        <div className="mt-1 text-sm font-medium">
                            {item.kelas ?? "-"}
                        </div>
                    </div>

                    <div className="rounded-2xl border bg-muted/30 px-3 py-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <ClipboardCheck className="h-3.5 w-3.5" />
                            Mapel
                        </div>
                        <div className="mt-1 text-sm font-medium">
                            {item.mapel ?? "-"}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <span>Pretest: {item.pretest?.status ?? "missing"}</span>
                    {item.practice_status === "graded" &&
                        item.practice_score !== null && (
                            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">
                                Nilai praktek: {item.practice_score}
                            </span>
                        )}
                </div>

                <div className="flex items-center justify-end">
                    {item.can_open ? (
                        <SiswaMateriDrawer
                            materiId={item.id}
                            trigger={trigger}
                        />
                    ) : (
                        trigger
                    )}
                </div>
            </div>
        </div>
    );
}

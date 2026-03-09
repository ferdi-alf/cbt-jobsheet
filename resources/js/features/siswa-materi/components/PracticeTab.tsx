import { useMemo } from "react";
import { toast } from "sonner";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/Components/ui/accordion";
import { Badge } from "@/Components/ui/badge";
import { CheckCircle2, ClipboardCheck, Clock3, XCircle } from "lucide-react";
import { usePracticeComposer } from "../hooks/usePracticeComposer";
import type { SiswaMateriDetail } from "../types";
import PracticeChecklistPanel from "./PracticeChecklistPanel";
import PracticeSubmitButton from "./PracticeSubmitButton";

function statusBadges(status: string) {
    if (status === "draft") {
        return "Draf";
    }

    if (status === "graded") {
        return "Sudah dinilai";
    }

    if (status === "submitted") {
        return "sudah dikerjakan";
    }

    return "Belum dikerjakan";
}

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

export default function PracticeTab({
    materiId,
    initial,
}: {
    materiId: number;
    initial: SiswaMateriDetail["practice"];
}) {
    const {
        practice,
        checklists,
        canEdit,
        emptyCount,
        submitting,
        submitAll,
        uploadFiles,
        removePhoto,
    } = usePracticeComposer({
        materiId,
        initial,
    });

    const defaultOpen = useMemo(
        () => (checklists[0] ? `item-${checklists[0].id}` : undefined),
        [checklists],
    );

    if (!practice.rule_id) {
        return (
            <div className="rounded-2xl border bg-background p-4 text-sm text-muted-foreground">
                Belum ada praktek untuk materi ini.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-3xl border bg-background p-4 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                        <div className="text-lg font-semibold">
                            {practice.title || "Praktek"}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground whitespace-pre-line">
                            {practice.description ||
                                "Upload foto sesuai checklist praktek di bawah ini."}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 md:justify-end">
                        <Badge variant="outline" className="gap-1.5">
                            <Clock3 className="h-3.5 w-3.5" />
                            Deadline: {fmt(practice.deadline_at)}
                        </Badge>
                        <Badge
                            variant={
                                practice.status === "graded"
                                    ? "default"
                                    : "secondary"
                            }
                        >
                            {statusBadges(practice.status)}
                        </Badge>
                    </div>
                </div>

                {practice.status === "graded" &&
                    practice.total_score !== null && (
                        <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3 text-sm dark:border-emerald-900 dark:bg-emerald-950/30">
                            <div className="font-medium">Nilai praktek</div>
                            <div className="mt-1 text-xl font-semibold">
                                {practice.total_score}
                            </div>
                        </div>
                    )}

                {practice.feedback?.trim() && (
                    <div className="mt-3 rounded-2xl border p-3 text-sm text-muted-foreground whitespace-pre-line">
                        {practice.feedback}
                    </div>
                )}
            </div>

            <Accordion
                type="single"
                collapsible
                defaultValue={defaultOpen}
                className="space-y-3"
            >
                {checklists.map((checklist) => {
                    const hasPhotos = checklist.photos.length > 0;
                    const graded = practice.status === "graded";
                    const submitted = practice.status === "submitted" || graded;
                    const headingClass = hasPhotos
                        ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/30"
                        : submitted
                          ? "border-red-200 bg-red-50/60 dark:border-red-900 dark:bg-red-950/30"
                          : "bg-background";

                    return (
                        <AccordionItem
                            key={checklist.id}
                            value={`item-${checklist.id}`}
                            className={`rounded-2xl border px-4 ${headingClass}`}
                        >
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex min-w-0 items-center gap-3 text-left">
                                    {hasPhotos ? (
                                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                                    ) : (
                                        <ClipboardCheck className="h-5 w-5 shrink-0 opacity-40" />
                                    )}

                                    <div className="min-w-0">
                                        <div className="font-medium">
                                            Checklist {checklist.order}:{" "}
                                            {checklist.title}
                                        </div>
                                        <div className="mt-1 flex flex-wrap gap-2">
                                            {hasPhotos ? (
                                                <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                                                    {graded
                                                        ? "Sudah dinilai"
                                                        : submitted
                                                          ? "Terkumpul"
                                                          : "Terisi"}
                                                </Badge>
                                            ) : submitted ? (
                                                <Badge
                                                    variant="destructive"
                                                    className="gap-1.5"
                                                >
                                                    <XCircle className="h-3.5 w-3.5" />
                                                    Belum ada foto
                                                </Badge>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            </AccordionTrigger>

                            <AccordionContent>
                                <PracticeChecklistPanel
                                    checklist={checklist as any}
                                    canEdit={canEdit}
                                    onUpload={uploadFiles}
                                    onDelete={removePhoto}
                                />
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>

            {canEdit && (
                <div className="flex items-center justify-end">
                    <PracticeSubmitButton
                        disabled={checklists.every(
                            (item) => item.photos.length === 0,
                        )}
                        emptyCount={emptyCount}
                        submitting={submitting}
                        onConfirm={async (confirmIncomplete) => {
                            try {
                                await submitAll(confirmIncomplete);
                            } catch (e: any) {
                                toast.error(
                                    e?.message ?? "Gagal mengumpulkan praktek",
                                );
                            }
                        }}
                    />
                </div>
            )}
        </div>
    );
}

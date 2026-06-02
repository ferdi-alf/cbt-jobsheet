import { Textarea } from "@/Components/ui/textarea";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/Components/ui/accordion";
import {
    CheckCircle2,
    ClipboardCheck,
    XCircle,
    AlertCircle,
} from "lucide-react";
import type { PracticeResultDetail } from "../types";
import PracticeResultPhotoDialog from "./PracticeResultPhotoDialog";

export default function PracticeResultChecklistAccordion({
    checklists,
    notes,
    scores,
    onChangeNote,
    onChangeScore,
}: {
    checklists: PracticeResultDetail["practice"]["checklists"];
    notes: Record<number, string>;
    scores: Record<number, string>;
    onChangeNote: (checklistId: number, value: string) => void;
    onChangeScore: (checklistId: number, value: string) => void;
}) {
    return (
        <Accordion type="multiple" className="space-y-3">
            {checklists.map((checklist) => {
                const hasPhotos = checklist.photos.length > 0;
                const scoreVal = scores[checklist.id] ?? "";
                const scoreMissing = scoreVal === "" || scoreVal === undefined;

                const headingClass = hasPhotos
                    ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/30"
                    : "border-red-200 bg-red-50/60 dark:border-red-900 dark:bg-red-950/30";

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

                                <div className="min-w-0 flex-1">
                                    <div className="font-medium">
                                        Checklist {checklist.order}:{" "}
                                        {checklist.title}
                                    </div>
                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                        {hasPhotos ? (
                                            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                                                Ada kumpulan foto
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="destructive"
                                                className="gap-1.5"
                                            >
                                                <XCircle className="h-3.5 w-3.5" />
                                                Belum ada foto
                                            </Badge>
                                        )}
                                        {scoreMissing ? (
                                            <Badge
                                                variant="outline"
                                                className="gap-1 border-amber-400 text-amber-600"
                                            >
                                                <AlertCircle className="h-3 w-3" />
                                                Belum dinilai
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="outline"
                                                className="border-blue-400 text-blue-600"
                                            >
                                                Nilai: {scoreVal}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </AccordionTrigger>

                        <AccordionContent>
                            <div className="space-y-4">
                                {(checklist.standar?.trim() ||
                                    checklist.keterangan?.trim()) && (
                                    <div className="grid gap-2 rounded-xl border bg-muted/30 p-3 text-sm">
                                        {checklist.standar?.trim() && (
                                            <div>
                                                <span className="font-medium">
                                                    Standar:{" "}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {checklist.standar}
                                                </span>
                                            </div>
                                        )}
                                        {checklist.keterangan?.trim() && (
                                            <div>
                                                <span className="font-medium">
                                                    Keterangan:{" "}
                                                </span>
                                                <span className="text-muted-foreground whitespace-pre-line">
                                                    {checklist.keterangan}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Foto */}
                                <div className="flex flex-wrap gap-3">
                                    {checklist.photos.map((photo) => (
                                        <PracticeResultPhotoDialog
                                            key={photo.id}
                                            url={photo.view_url}
                                        />
                                    ))}
                                </div>

                                {/* Nilai per item */}
                                <div className="space-y-2">
                                    <div className="text-sm font-medium">
                                        Nilai checklist ini{" "}
                                        <span className="text-muted-foreground font-normal">
                                            (0 – 100, wajib diisi)
                                        </span>
                                    </div>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={scoreVal}
                                        onChange={(e) =>
                                            onChangeScore(
                                                checklist.id,
                                                e.target.value,
                                            )
                                        }
                                        placeholder="0 - 100"
                                        className={
                                            scoreMissing
                                                ? "border-amber-400 focus-visible:ring-amber-400"
                                                : ""
                                        }
                                    />
                                </div>

                                {(checklist.hasil?.trim() ||
                                    checklist.keterangan?.trim()) && (
                                    <div className="grid gap-2 rounded-xl border bg-muted/30 p-3 text-sm">
                                        <div className="font-medium text-xs text-muted-foreground uppercase tracking-wide">
                                            Jawaban Siswa
                                        </div>
                                        {checklist.hasil?.trim() && (
                                            <div>
                                                <span className="font-medium">
                                                    Hasil:{" "}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {checklist.hasil}
                                                </span>
                                            </div>
                                        )}
                                        {checklist.keterangan?.trim() && (
                                            <div>
                                                <span className="font-medium">
                                                    Keterangan:{" "}
                                                </span>
                                                <span className="text-muted-foreground whitespace-pre-line">
                                                    {checklist.keterangan}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Catatan per item */}
                                <div className="space-y-2">
                                    <div className="text-sm font-medium">
                                        Catatan per checklist{" "}
                                        <span className="text-muted-foreground font-normal">
                                            (opsional)
                                        </span>
                                    </div>
                                    <Textarea
                                        value={notes[checklist.id] ?? ""}
                                        onChange={(e) =>
                                            onChangeNote(
                                                checklist.id,
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Tulis catatan untuk checklist ini..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                );
            })}
        </Accordion>
    );
}

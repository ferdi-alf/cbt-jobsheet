import { Textarea } from "@/Components/ui/textarea";
import { Badge } from "@/Components/ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/Components/ui/accordion";
import { CheckCircle2, ClipboardCheck, XCircle } from "lucide-react";
import type { PracticeResultDetail } from "../types";
import PracticeResultPhotoDialog from "./PracticeResultPhotoDialog";

export default function PracticeResultChecklistAccordion({
    checklists,
    notes,
    onChangeNote,
}: {
    checklists: PracticeResultDetail["practice"]["checklists"];
    notes: Record<number, string>;
    onChangeNote: (checklistId: number, value: string) => void;
}) {
    return (
        <Accordion type="multiple" className="space-y-3">
            {checklists.map((checklist) => {
                const hasPhotos = checklist.photos.length > 0;
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

                                <div className="min-w-0">
                                    <div className="font-medium">
                                        Checklist {checklist.order}:{" "}
                                        {checklist.title}
                                    </div>
                                    <div className="mt-1 flex flex-wrap gap-2">
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
                                    </div>
                                </div>
                            </div>
                        </AccordionTrigger>

                        <AccordionContent>
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-3">
                                    {checklist.photos.map((photo) => (
                                        <PracticeResultPhotoDialog
                                            key={photo.id}
                                            url={photo.view_url}
                                        />
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <div className="text-sm font-medium">
                                        Catatan per checklist
                                    </div>
                                    <Textarea
                                        value={notes[checklist.id] ?? ""}
                                        onChange={(e) =>
                                            onChangeNote(
                                                checklist.id,
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Opsional. Tulis catatan untuk checklist ini..."
                                        rows={4}
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

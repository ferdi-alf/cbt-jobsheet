import { useEffect, useMemo, useState } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Badge } from "@/Components/ui/badge";
import { toast } from "sonner";
import type { PracticeResultDetail } from "../types";
import { usePracticeResultMutations } from "../hooks/usePracticeResultMutations";
import PracticeResultChecklistAccordion from "./PracticeResultChecklistAccordion";

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

export default function PracticeResultDrawerContent({
    detail,
    onSaved,
}: {
    detail: PracticeResultDetail;
    onSaved?: () => void;
}) {
    const [score, setScore] = useState<string>(
        String(detail.total_score ?? ""),
    );
    const [feedback, setFeedback] = useState(detail.feedback ?? "");
    const [notes, setNotes] = useState<Record<number, string>>({});

    useEffect(() => {
        setScore(String(detail.total_score ?? ""));
        setFeedback(detail.feedback ?? "");
        setNotes(
            Object.fromEntries(
                detail.practice.checklists.map((item) => [
                    item.id,
                    item.note ?? "",
                ]),
            ),
        );
    }, [detail]);

    const mutations = usePracticeResultMutations(onSaved);

    const hasMissingChecklist = useMemo(
        () =>
            detail.practice.checklists.some((item) => item.photos.length === 0),
        [detail.practice.checklists],
    );

    const save = async () => {
        const numScore = Number(score);
        if (!Number.isFinite(numScore) || numScore < 0 || numScore > 100) {
            toast.error("Nilai total harus diisi 0 sampai 100");
            return;
        }

        try {
            await mutations.grade(detail.id, {
                total_score: Math.round(numScore),
                feedback: feedback.trim() || null,
                notes: detail.practice.checklists.map((item) => ({
                    checklist_id: item.id,
                    note: notes[item.id]?.trim() || null,
                })),
            });
        } catch (e: any) {
            if (e?.status === 422) {
                toast.error(
                    e?.payload?.message ??
                        "Periksa kembali data penilaian praktek.",
                );
                return;
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="rounded-3xl border bg-background p-4 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                        <div className="text-lg font-semibold">
                            {detail.student.full_name}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                            {detail.student.email ?? "-"}
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                            {detail.materi.title}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 md:justify-end">
                        <Badge variant="outline">
                            Dikumpulkan: {fmt(detail.submitted_at)}
                        </Badge>
                        <Badge
                            variant={
                                detail.status === "graded"
                                    ? "default"
                                    : "secondary"
                            }
                        >
                            {detail.status === "graded"
                                ? "Sudah dinilai"
                                : "Dikumpulkan - belum dinilai"}
                        </Badge>
                    </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <InfoCard
                        label="Judul praktek"
                        value={detail.practice.title || "Praktek"}
                    />
                    <InfoCard
                        label="Deadline"
                        value={fmt(detail.practice.deadline_at)}
                    />
                    <InfoCard
                        label="Dinilai oleh"
                        value={detail.grader?.name ?? "-"}
                    />
                    <InfoCard
                        label="Waktu dinilai"
                        value={fmt(detail.graded_at)}
                    />
                </div>

                {detail.practice.description?.trim() && (
                    <div className="mt-3 rounded-2xl border p-3 text-sm text-muted-foreground whitespace-pre-line">
                        {detail.practice.description}
                    </div>
                )}
            </div>

            <div className="rounded-3xl border bg-background p-4 shadow-sm">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label>Nilai total</Label>
                        <Input
                            type="number"
                            min={0}
                            max={100}
                            value={score}
                            onChange={(e) => setScore(e.target.value)}
                            placeholder="0 - 100"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Feedback praktek</Label>
                        <Textarea
                            rows={4}
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Opsional. Tulis feedback umum untuk siswa..."
                        />
                    </div>
                </div>

                {hasMissingChecklist && (
                    <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                        Masih ada checklist tanpa foto. Anda tetap bisa memberi
                        nilai dan catatan.
                    </div>
                )}

                <div className="mt-4 flex justify-end">
                    <Button onClick={save}>Simpan Penilaian</Button>
                </div>
            </div>

            <PracticeResultChecklistAccordion
                checklists={detail.practice.checklists}
                notes={notes}
                onChangeNote={(checklistId, value) =>
                    setNotes((prev) => ({ ...prev, [checklistId]: value }))
                }
            />

            <div className="rounded-3xl border bg-background p-4 shadow-sm">
                <div className="grid gap-3 md:grid-cols-3">
                    <InfoCard
                        label="Nilai praktek"
                        value={detail.total_score ?? "-"}
                    />
                    <InfoCard
                        label="Dinilai oleh"
                        value={detail.grader?.name ?? "-"}
                    />
                    <InfoCard
                        label="Feedback tersimpan"
                        value={detail.feedback?.trim() ? "Ada" : "-"}
                    />
                </div>
            </div>
        </div>
    );
}

function InfoCard({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="rounded-2xl border p-3">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="mt-1 font-medium">{value}</div>
        </div>
    );
}

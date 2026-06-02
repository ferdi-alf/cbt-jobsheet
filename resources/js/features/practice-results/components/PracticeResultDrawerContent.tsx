import { useEffect, useMemo, useState } from "react";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Badge } from "@/Components/ui/badge";
import { toast } from "sonner";
import type { PracticeResultDetail } from "../types";
import { usePracticeResultMutations } from "../hooks/usePracticeResultMutations";
import PracticeResultChecklistAccordion from "./PracticeResultChecklistAccordion";
import PracticeResultPhotoDialog from "./PracticeResultPhotoDialog";

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
    const [feedback, setFeedback] = useState(detail.feedback ?? "");
    const [notes, setNotes] = useState<Record<number, string>>({});
    const [scores, setScores] = useState<Record<number, string>>({});

    useEffect(() => {
        setFeedback(detail.feedback ?? "");
        setNotes(
            Object.fromEntries(
                detail.practice.checklists.map((item) => [
                    item.id,
                    item.note ?? "",
                ]),
            ),
        );
        setScores(
            Object.fromEntries(
                detail.practice.checklists.map((item) => [
                    item.id,
                    item.score !== null && item.score !== undefined
                        ? String(item.score)
                        : "",
                ]),
            ),
        );
    }, [detail]);

    const mutations = usePracticeResultMutations(onSaved);

    // Hitung preview rata-rata dari yang sudah diisi
    const { computedAvg, missingCount } = useMemo(() => {
        const checklists = detail.practice.checklists;
        const missing = checklists.filter((c) => {
            const v = scores[c.id];
            return v === "" || v === undefined || v === null;
        }).length;
        const filled = checklists
            .map((c) => Number(scores[c.id]))
            .filter((v) => Number.isFinite(v));
        const avg =
            filled.length > 0
                ? Math.round(filled.reduce((a, b) => a + b, 0) / filled.length)
                : null;
        return { computedAvg: avg, missingCount: missing };
    }, [scores, detail.practice.checklists]);

    const save = async () => {
        if (missingCount > 0) {
            toast.error(
                `Masih ada ${missingCount} checklist yang belum dinilai. Isi semua nilai terlebih dahulu.`,
            );
            return;
        }

        const notes_payload = detail.practice.checklists.map((item) => ({
            checklist_id: item.id,
            score: Math.round(Number(scores[item.id])),
            note: notes[item.id]?.trim() || null,
        }));

        try {
            await mutations.grade(detail.id, {
                feedback: feedback.trim() || null,
                notes: notes_payload,
            });
        } catch (e: any) {
            if (e?.status === 422) {
                toast.error(
                    e?.payload?.message ??
                        "Periksa kembali data penilaian praktek.",
                );
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
                                : "Belum dinilai"}
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

                {(detail.materi.elemen?.trim() ||
                    detail.materi.tujuan_pembelajaran?.trim() ||
                    detail.materi.k3_alat_bahan?.trim()) && (
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                        {detail.materi.elemen?.trim() && (
                            <InfoCard
                                label="Elemen"
                                value={detail.materi.elemen}
                            />
                        )}
                        {detail.materi.tujuan_pembelajaran?.trim() && (
                            <InfoCard
                                label="Tujuan Pembelajaran"
                                value={detail.materi.tujuan_pembelajaran}
                            />
                        )}
                        {detail.materi.k3_alat_bahan?.trim() && (
                            <InfoCard
                                label="K3 dan APD"
                                value={detail.materi.k3_alat_bahan}
                            />
                        )}
                    </div>
                )}

                {detail.practice.description?.trim() && (
                    <div className="mt-3 rounded-2xl border p-3 text-sm text-muted-foreground whitespace-pre-line">
                        {detail.practice.description}
                    </div>
                )}
                {detail.apd_photos?.length > 0 && (
                    <div className="rounded-3xl border bg-background p-4 shadow-sm">
                        <div className="font-semibold mb-3">
                            Bukti Pemakaian K3 / APD
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {detail.apd_photos.map((photo) => (
                                <PracticeResultPhotoDialog
                                    key={photo.id}
                                    url={photo.view_url}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="rounded-3xl border bg-background p-4 shadow-sm">
                {missingCount > 0 && (
                    <div className="mb-4 rounded-2xl border border-amber-300 bg-amber-50/70 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                        {missingCount} checklist belum dinilai — isi semua nilai
                        sebelum menyimpan.
                    </div>
                )}

                <div className="grid gap-3 md:grid-cols-3 mb-4">
                    <InfoCard
                        label="Nilai rata-rata (preview)"
                        value={
                            computedAvg !== null ? (
                                <span className="text-xl font-bold text-primary">
                                    {computedAvg}
                                </span>
                            ) : (
                                <span className="text-muted-foreground">—</span>
                            )
                        }
                    />
                    <InfoCard
                        label="Item dinilai"
                        value={`${detail.practice.checklists.length - missingCount} / ${detail.practice.checklists.length}`}
                    />
                    <InfoCard
                        label="Nilai tersimpan"
                        value={detail.total_score ?? "-"}
                    />
                </div>

                <div className="grid gap-2">
                    <Label>
                        Feedback umum{" "}
                        <span className="text-muted-foreground font-normal">
                            (opsional)
                        </span>
                    </Label>
                    <Textarea
                        rows={3}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Tulis feedback umum untuk siswa..."
                    />
                </div>

                <div className="mt-4 flex justify-end">
                    <Button disabled={missingCount > 0} onClick={save}>
                        Simpan Penilaian
                    </Button>
                </div>
            </div>
            <PracticeResultChecklistAccordion
                checklists={detail.practice.checklists}
                notes={notes}
                scores={scores}
                onChangeNote={(id, v) => setNotes((p) => ({ ...p, [id]: v }))}
                onChangeScore={(id, v) => setScores((p) => ({ ...p, [id]: v }))}
            />
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

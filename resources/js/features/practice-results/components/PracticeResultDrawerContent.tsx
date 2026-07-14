import { useEffect, useMemo, useState } from "react";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Input } from "@/Components/ui/input";
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

    // 3 komponen nilai (manual): Alat&Bahan 25%, SOP/APD/K3L 15%, Praktek 60%
    const [scoreAB, setScoreAB] = useState("");
    const [scoreSOP, setScoreSOP] = useState("");
    const [scorePraktik, setScorePraktik] = useState("");

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
        setScoreAB(
            detail.score_alat_bahan != null
                ? String(detail.score_alat_bahan)
                : "",
        );
        setScoreSOP(
            detail.score_sop_k3l != null ? String(detail.score_sop_k3l) : "",
        );
        setScorePraktik(
            detail.score_praktik != null ? String(detail.score_praktik) : "",
        );
    }, [detail]);

    const mutations = usePracticeResultMutations(onSaved);

    // Total berbobot dari 3 komponen nilai: AB 25% + SOP/APD/K3L 15% + Praktek 60%
    const { allFilled, valid, weightedTotal } = useMemo(() => {
        const toNum = (v: string) => {
            const n = Number(v);
            return v.trim() !== "" && Number.isFinite(n) ? n : null;
        };
        const inRange = (n: number | null) => n !== null && n >= 0 && n <= 100;

        const ab = toNum(scoreAB);
        const sop = toNum(scoreSOP);
        const praktik = toNum(scorePraktik);

        const allFilled = ab !== null && sop !== null && praktik !== null;
        const valid = inRange(ab) && inRange(sop) && inRange(praktik);
        const weightedTotal = valid
            ? Math.round(ab! * 0.25 + sop! * 0.15 + praktik! * 0.6)
            : null;

        return { allFilled, valid, weightedTotal };
    }, [scoreAB, scoreSOP, scorePraktik]);

    const save = async () => {
        if (!valid) {
            toast.error(
                "Isi ketiga nilai (Alat & Bahan, SOP/APD/K3L, Praktek) dengan angka 0–100.",
            );
            return;
        }

        const notes_payload = detail.practice.checklists.map((item) => ({
            checklist_id: item.id,
            score: scores[item.id]?.trim()
                ? Math.round(Number(scores[item.id]))
                : null,
            note: notes[item.id]?.trim() || null,
        }));

        try {
            await mutations.grade(detail.id, {
                feedback: feedback.trim() || null,
                score_alat_bahan: Math.round(Number(scoreAB)),
                score_sop_k3l: Math.round(Number(scoreSOP)),
                score_praktik: Math.round(Number(scorePraktik)),
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
            {detail.practice.tools?.length > 0 && (
                <div className="rounded-3xl border bg-background p-4 shadow-sm">
                    <div className="mb-3 font-semibold">
                        Alat &amp; Bahan (jawaban siswa)
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {(["alat", "bahan"] as const).map((kind) => {
                            const rows = detail.practice.tools.filter(
                                (t) => t.kind === kind,
                            );
                            if (rows.length === 0) return null;
                            return (
                                <div
                                    key={kind}
                                    className="rounded-2xl border p-3"
                                >
                                    <div className="mb-2 text-sm font-semibold capitalize">
                                        {kind}
                                    </div>
                                    <ul className="space-y-2 text-sm">
                                        {rows.map((t, i) => (
                                            <li key={i} className="space-y-1">
                                                <div className="flex gap-2">
                                                    <span className="font-medium">
                                                        {t.label || "-"}:
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        {t.value?.trim() || "—"}
                                                    </span>
                                                </div>
                                                {t.photos &&
                                                    t.photos.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {t.photos.map(
                                                                (p) => (
                                                                    <a
                                                                        key={
                                                                            p.id
                                                                        }
                                                                        href={
                                                                            p.view_url
                                                                        }
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                    >
                                                                        <img
                                                                            src={
                                                                                p.view_url
                                                                            }
                                                                            alt="Foto"
                                                                            className="h-14 w-14 rounded border object-cover"
                                                                        />
                                                                    </a>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="rounded-3xl border bg-background p-4 shadow-sm">
                <div className="mb-3 font-semibold">Penilaian Praktek</div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <ScoreInput
                        label="Nilai Alat & Bahan"
                        weight="25%"
                        value={scoreAB}
                        onChange={setScoreAB}
                    />
                    <ScoreInput
                        label="Nilai SOP, APD & K3L"
                        weight="15%"
                        value={scoreSOP}
                        onChange={setScoreSOP}
                    />
                    <ScoreInput
                        label="Nilai Praktek"
                        weight="60%"
                        value={scorePraktik}
                        onChange={setScorePraktik}
                    />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border bg-primary/5 p-3">
                        <div className="text-xs text-muted-foreground">
                            Nilai Total (preview)
                        </div>
                        <div className="mt-1 text-2xl font-bold text-primary">
                            {weightedTotal !== null ? weightedTotal : "—"}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                            25% Alat&amp;Bahan + 15% SOP/APD/K3L + 60% Praktek
                        </div>
                    </div>
                    <InfoCard
                        label="Nilai tersimpan"
                        value={detail.total_score ?? "-"}
                    />
                </div>

                <div className="mt-4 grid gap-2">
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
                    <Button disabled={!allFilled} onClick={save}>
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

function ScoreInput({
    label,
    weight,
    value,
    onChange,
}: {
    label: string;
    weight: string;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="rounded-2xl border p-3">
            <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-medium">{label}</div>
                <Badge variant="secondary" className="text-[10px]">
                    {weight}
                </Badge>
            </div>
            <Input
                type="number"
                min={0}
                max={100}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="0–100"
                className="mt-2"
            />
        </div>
    );
}

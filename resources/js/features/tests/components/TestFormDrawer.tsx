import { useEffect, useMemo, useState } from "react";
import EntityDrawer from "@/Components/drawers/EntityDrawer";
import { Button } from "@/Components/ui/button";
import { toast } from "sonner";
import { useBulkGroups } from "@/hooks/bulk/useBulkGroups";

import { getTest } from "../api/tests.api";
import { useTestMutations } from "../hooks/useTestMutations";
import { useTestLookups } from "../hooks/useTestLookups";
import type { TestDetailForEdit, TestType } from "../types";

import TestFormFields, { FormState } from "./TestFormFields";
import TestQuestionsBulk from "./TestQuestionsBulk";

type QuestionForm = {
    question: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    option_e: string;
    correct_option: "a" | "b" | "c" | "d" | "e";
};

const emptyQuestion = (): QuestionForm => ({
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    option_e: "",
    correct_option: "a",
});

const emptyForm = (): FormState => ({
    materi_id: "",
    type: "pretest",
    title: "",
    duration_minutes: "60",
    start_at: "",
    end_at: "",
    is_score_visible: true,
});

function fromApiToForm(d?: TestDetailForEdit): FormState {
    if (!d) return emptyForm();

    const toLocal = (s?: string | null) =>
        s ? s.replace(" ", "T").slice(0, 16) : "";

    return {
        materi_id: String(d.materi_id ?? ""),
        type: d.type,
        title: d.title ?? "",
        duration_minutes: String(d.duration_minutes ?? 60) as any,
        start_at: toLocal(d.start_at),
        end_at: toLocal(d.end_at),
        is_score_visible: !!d.is_score_visible,
    };
}

export default function TestFormDrawer({
    mode,
    testId,
    trigger,
}: {
    mode: "create" | "edit";
    testId?: number;
    trigger: React.ReactNode;
}) {
    const isEdit = mode === "edit";
    const [open, setOpen] = useState(false);

    const { materis } = useTestLookups(open);

    const [form, setForm] = useState<FormState>(() => emptyForm());
    const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

    const bulk = useBulkGroups<QuestionForm>({
        initialItem: emptyQuestion,
        errorPrefix: "questions",
    });

    const mutations = useTestMutations(() => setOpen(false));

    const set = (k: keyof FormState, v: any) =>
        setForm((p) => ({ ...p, [k]: v }));

    useEffect(() => {
        if (!open) return;

        setFormErrors({});
        bulk.clearErrors();

        if (!isEdit) {
            setForm(emptyForm());
            bulk.setItems([emptyQuestion()]);
            return;
        }

        (async () => {
            try {
                const d = await getTest(Number(testId));
                setForm(fromApiToForm(d));
                bulk.setItems(
                    (d.questions?.length ? d.questions : [emptyQuestion()]).map(
                        (q) => ({
                            question: q.question ?? "",
                            option_a: q.option_a ?? "",
                            option_b: q.option_b ?? "",
                            option_c: q.option_c ?? "",
                            option_d: q.option_d ?? "",
                            option_e: q.option_e ?? "",
                            correct_option: (q.correct_option ?? "a") as any,
                        }),
                    ),
                );
            } catch (e: any) {
                toast.error(e?.message ?? "Gagal memuat test");
            }
        })();
    }, [open, isEdit, testId]);

    const canSubmit = useMemo(() => {
        if (!form.materi_id) return false;
        if (!form.title.trim()) return false;
        if (!bulk.items.length) return false;
        return true;
    }, [form, bulk.items.length]);

    const clientValidate = () => {
        const errs: Record<string, string[]> = {};
        const req = (key: string, ok: boolean, msg: string) => {
            if (!ok) errs[key] = [msg];
        };

        req("materi_id", !!form.materi_id, "Materi wajib dipilih");
        req("title", !!form.title.trim(), "Judul wajib diisi");

        bulk.items.forEach((q, idx) => {
            const base = `questions.${idx}`;
            const v = (s: any) => String(s ?? "").trim();
            req(`${base}.question`, !!v(q.question), "Soal wajib diisi");
            req(`${base}.option_a`, !!v(q.option_a), "Opsi wajib diisi");
            req(`${base}.option_b`, !!v(q.option_b), "Opsi wajib diisi");
            req(`${base}.option_c`, !!v(q.option_c), "Opsi wajib diisi");
            req(`${base}.option_d`, !!v(q.option_d), "Opsi wajib diisi");
            req(`${base}.option_e`, !!v(q.option_e), "Opsi wajib diisi");
            req(
                `${base}.correct_option`,
                !!v(q.correct_option),
                "Pilih jawaban benar",
            );
        });

        if (Object.keys(errs).length) {
            setFormErrors(errs);
            bulk.setErrors(errs);
            bulk.scrollToFirstError();
            toast.error("Masih ada input yang kosong", {
                description: "Periksa kembali field yang ditandai merah.",
            });
            return false;
        }
        return true;
    };

    const submit = async () => {
        setFormErrors({});
        bulk.clearErrors();

        if (!clientValidate()) return;

        const payload = {
            materi_id: Number(form.materi_id),
            type: form.type,
            title: form.title.trim(),
            duration_minutes: Number(form.duration_minutes),
            start_at: form.start_at
                ? form.start_at.replace("T", " ") + ":00"
                : null,
            end_at: form.end_at ? form.end_at.replace("T", " ") + ":00" : null,
            is_score_visible: !!form.is_score_visible,
            questions: bulk.items.map((q) => ({
                question: q.question.trim(),
                option_a: q.option_a.trim(),
                option_b: q.option_b.trim(),
                option_c: q.option_c.trim(),
                option_d: q.option_d.trim(),
                option_e: q.option_e.trim(),
                correct_option: q.correct_option,
            })),
        };

        try {
            if (isEdit) await mutations.update(Number(testId), payload as any);
            else await mutations.create(payload as any);
        } catch (e: any) {
            if (e?.status === 422) {
                const p = e?.payload ?? {};
                const errs = (p?.errors ?? {}) as Record<string, string[]>;
                setFormErrors(errs);

                const hasBulkErr = Object.keys(errs).some((k) =>
                    k.startsWith("questions."),
                );
                if (hasBulkErr) {
                    bulk.setErrors(errs);
                    bulk.scrollToFirstError();
                }

                toast.error("Data tidak valid", {
                    description:
                        p?.message ??
                        "Periksa kembali input yang ditandai merah.",
                });
                return;
            }

            toast.error("Gagal menyimpan test", {
                description: e?.message ?? "Terjadi kesalahan",
            });
        }
    };

    const title = isEdit ? "Edit Test" : "Tambah Test";

    return (
        <EntityDrawer<any>
            variant="slide"
            title={title}
            trigger={trigger}
            open={open}
            onOpenChange={setOpen}
            render={() => (
                <div className="space-y-4">
                    <TestFormFields
                        form={form}
                        set={set}
                        materis={materis}
                        formErrors={formErrors}
                    />
                    <TestQuestionsBulk bulk={bulk} />

                    <div className="flex items-center justify-end gap-2 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button disabled={!canSubmit} onClick={submit}>
                            {isEdit ? "Update" : "Simpan"}
                        </Button>
                    </div>
                </div>
            )}
        />
    );
}

import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import BulkGroups from "@/Components/bulk/BulkGroups";
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group";

type QuestionForm = {
    question: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    option_e: string;
    correct_option: "a" | "b" | "c" | "d" | "e";
};

export default function TestQuestionsBulk({ bulk }: { bulk: any }) {
    return (
        <BulkGroups<QuestionForm>
            title="Soal"
            addLabel="Tambah Soal"
            itemsLabelPrefix="Soal"
            bulk={bulk}
            renderItem={(q, idx, api) => {
                const err = (f: keyof QuestionForm) =>
                    api.getFieldError(idx, String(f));
                const borderErr = (f: keyof QuestionForm) =>
                    err(f) ? "border-destructive" : "";

                return (
                    <div className="space-y-3 text-start">
                        <div className="grid gap-2">
                            <Label>Pertanyaan</Label>
                            <Input
                                className={borderErr("question")}
                                value={q.question}
                                onChange={(e) =>
                                    api.update(idx, {
                                        question: e.target.value,
                                    })
                                }
                                placeholder="Tulis pertanyaan..."
                            />
                            {err("question") && (
                                <div className="text-sm text-destructive">
                                    {err("question")}
                                </div>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label>Jawaban (pilih yang benar)</Label>

                            <RadioGroup
                                value={q.correct_option}
                                onValueChange={(v: any) =>
                                    api.update(idx, { correct_option: v })
                                }
                                className="grid gap-2"
                            >
                                {(
                                    [
                                        ["a", "option_a"],
                                        ["b", "option_b"],
                                        ["c", "option_c"],
                                        ["d", "option_d"],
                                        ["e", "option_e"],
                                    ] as const
                                ).map(([opt, key]) => {
                                    const field = key as keyof QuestionForm;
                                    const fieldErr = api.getFieldError(
                                        idx,
                                        String(field),
                                    );
                                    return (
                                        <div
                                            key={opt}
                                            className="flex items-center gap-3"
                                        >
                                            <RadioGroupItem
                                                value={opt}
                                                id={`q-${idx}-${opt}`}
                                            />
                                            <Input
                                                className={
                                                    fieldErr
                                                        ? "border-destructive"
                                                        : ""
                                                }
                                                value={(q as any)[field] ?? ""}
                                                onChange={(e) =>
                                                    api.update(idx, {
                                                        [field]: e.target.value,
                                                    } as any)
                                                }
                                                placeholder="Tulis jawaban..."
                                            />
                                        </div>
                                    );
                                })}
                            </RadioGroup>

                            {(api.getFieldError(idx, "option_a") ||
                                api.getFieldError(idx, "option_b") ||
                                api.getFieldError(idx, "option_c") ||
                                api.getFieldError(idx, "option_d") ||
                                api.getFieldError(idx, "option_e")) && (
                                <div className="text-sm text-destructive">
                                    Semua pilihan jawaban wajib diisi.
                                </div>
                            )}

                            {api.getFieldError(idx, "correct_option") && (
                                <div className="text-sm text-destructive">
                                    {api.getFieldError(idx, "correct_option")}
                                </div>
                            )}
                        </div>
                    </div>
                );
            }}
        />
    );
}

import { cn } from "@/lib/utils";
import type { TestOptionValue, TestQuestionItem } from "../types";

export default function TestQuestionCard({
    question,
    direction,
    onSelect,
}: {
    question: TestQuestionItem;
    direction: "next" | "prev";
    onSelect: (value: TestOptionValue) => void;
}) {
    const animation =
        direction === "next"
            ? "cbt-slide-next 220ms ease"
            : "cbt-slide-prev 220ms ease";

    return (
        <>
            <style>{`
                @keyframes cbt-slide-next {
                    from { opacity: 0; transform: translateX(24px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes cbt-slide-prev {
                    from { opacity: 0; transform: translateX(-24px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>

            <div key={question.id} style={{ animation }}>
                <div className="rounded-[28px] border bg-background/90 p-5 shadow-sm backdrop-blur-sm md:p-6">
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                            Soal {question.number}
                        </div>
                    </div>

                    <div className="text-base leading-7 whitespace-pre-line md:text-lg md:leading-8">
                        {question.question}
                    </div>

                    <div className="mt-6 space-y-3">
                        {question.options.map((opt) => {
                            const checked =
                                String(
                                    question.selected_option ?? "",
                                ).toUpperCase() ===
                                String(opt.value).toUpperCase();

                            return (
                                <label
                                    key={`${question.id}-${opt.value}`}
                                    className={cn(
                                        "flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition-all",
                                        checked
                                            ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                                            : "hover:border-primary/40 hover:bg-muted/30",
                                    )}
                                >
                                    <input
                                        type="radio"
                                        name={`question-${question.id}`}
                                        value={opt.value}
                                        checked={checked}
                                        onChange={() => onSelect(opt.value)}
                                        className="mt-1 h-4 w-4 shrink-0"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start gap-2">
                                            <span className="min-w-6 font-semibold text-primary">
                                                {opt.label}.
                                            </span>
                                            <span className="text-sm leading-6 whitespace-pre-line md:text-base md:leading-7">
                                                {opt.text}
                                            </span>
                                        </div>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}

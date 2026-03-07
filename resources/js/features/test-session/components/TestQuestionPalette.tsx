import { cn } from "@/lib/utils";
import type { TestQuestionItem } from "../types";

export default function TestQuestionPalette({
    questions,
    currentIndex,
    onJump,
}: {
    questions: TestQuestionItem[];
    currentIndex: number;
    onJump: (index: number) => void;
}) {
    return (
        <div className="rounded-3xl border bg-background/90 p-4 shadow-sm backdrop-blur-sm">
            <div className="mb-3 text-sm font-medium">Navigasi soal</div>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5">
                {questions.map((q, index) => {
                    const active = currentIndex === index;
                    const answered = !!q.selected_option;

                    return (
                        <button
                            key={q.id}
                            type="button"
                            onClick={() => onJump(index)}
                            className={cn(
                                "h-11 rounded-xl border text-sm font-medium transition",
                                active
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : answered
                                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300"
                                      : "bg-background hover:bg-muted",
                            )}
                        >
                            {q.number}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

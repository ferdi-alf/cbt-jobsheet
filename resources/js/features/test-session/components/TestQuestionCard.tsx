import { AnimatePresence, motion } from "framer-motion";
import type { TestQuestionItem, TestOptionValue } from "../types";

const OPTION_LABELS = ["A", "B", "C", "D", "E"] as const;

export default function TestQuestionCard({
    question,
    direction,
    onSelect,
}: {
    question: TestQuestionItem;
    direction: "next" | "prev";
    onSelect: (value: TestOptionValue) => void;
}) {
    const variants = {
        enter: (dir: string) => ({
            x: dir === "next" ? 40 : -40,
            opacity: 0,
        }),
        center: { x: 0, opacity: 1 },
        exit: (dir: string) => ({
            x: dir === "next" ? -40 : 40,
            opacity: 0,
        }),
    };

    return (
        <AnimatePresence mode="wait" custom={direction}>
            <motion.div
                key={question.id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="rounded-[28px] border bg-background/90 shadow-sm backdrop-blur-sm overflow-hidden"
            >
                <div className="px-6 pt-6 pb-4">
                    <p className="text-base font-medium leading-relaxed whitespace-pre-wrap">
                        {question.question}
                    </p>
                </div>

                {question.image_url && (
                    <div className="px-6 pb-4">
                        <div className="w-full overflow-hidden rounded-xl border bg-muted/20">
                            <img
                                src={question.image_url}
                                alt={`Gambar soal ${question.number}`}
                                className="
                                    mx-auto block
                                    w-full max-w-lg
                                    max-h-72
                                    object-contain
                                    bg-white dark:bg-zinc-900
                                "
                                loading="lazy"
                            />
                        </div>
                    </div>
                )}

                <div className="px-6 pb-6 grid gap-2.5">
                    {question.options.map((opt) => {
                        const isSelected =
                            question.selected_option === opt.value;

                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() =>
                                    onSelect(opt.value as TestOptionValue)
                                }
                                className={`
                                    flex w-full items-start gap-3 rounded-2xl border px-4 py-3
                                    text-left text-sm font-medium transition-all
                                    ${
                                        isSelected
                                            ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                                            : "border-border bg-background hover:border-primary/40 hover:bg-primary/5"
                                    }
                                `}
                            >
                                <span
                                    className={`
                                        flex h-6 w-6 shrink-0 items-center justify-center
                                        rounded-full text-xs font-bold
                                        ${
                                            isSelected
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-muted-foreground"
                                        }
                                    `}
                                >
                                    {opt.label}
                                </span>
                                <span className="leading-relaxed">
                                    {opt.text}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

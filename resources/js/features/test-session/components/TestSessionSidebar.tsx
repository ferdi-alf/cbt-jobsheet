import { LayoutGrid, NotebookPen } from "lucide-react";
import type { TestQuestionItem } from "../types";
import TestQuestionPalette from "./TestQuestionPalette";
import TestSubmitButton from "./TestSubmitButton";

export default function TestSessionSidebar({
    questions,
    currentIndex,
    answeredCount,
    totalQuestions,
    onJump,
    onSubmit,
    submitting,
}: {
    questions: TestQuestionItem[];
    currentIndex: number;
    answeredCount: number;
    totalQuestions: number;
    onJump: (index: number) => void;
    onSubmit: () => void;
    submitting: boolean;
}) {
    const unansweredCount = Math.max(0, totalQuestions - answeredCount);

    return (
        <div className="space-y-5">
            <div className="rounded-[28px] border bg-background/90 p-4 shadow-sm backdrop-blur-sm">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <LayoutGrid className="h-4 w-4" />
                    Navigasi soal
                </div>

                <TestQuestionPalette
                    questions={questions}
                    currentIndex={currentIndex}
                    onJump={onJump}
                />
            </div>

            <div className="rounded-[28px] border bg-background/90 p-4 shadow-sm backdrop-blur-sm">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <NotebookPen className="h-4 w-4" />
                    Ringkasan pengerjaan
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl border bg-muted/30 px-3 py-3">
                        <div className="text-xs text-muted-foreground">
                            Terjawab
                        </div>
                        <div className="mt-1 text-base font-semibold">
                            {answeredCount}
                        </div>
                    </div>
                    <div className="rounded-2xl border bg-muted/30 px-3 py-3">
                        <div className="text-xs text-muted-foreground">
                            Belum dijawab
                        </div>
                        <div className="mt-1 text-base font-semibold">
                            {unansweredCount}
                        </div>
                    </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <div>Baca soal dengan teliti sebelum memilih jawaban.</div>
                    <div>
                        Gunakan navigasi nomor untuk berpindah lebih cepat.
                    </div>
                    <div>
                        Periksa kembali jawaban sebelum menekan tombol kirim.
                    </div>
                </div>

                <TestSubmitButton
                    className="mt-4 w-full"
                    totalQuestions={totalQuestions}
                    answeredCount={answeredCount}
                    submitting={submitting}
                    onSubmit={onSubmit}
                />
            </div>
        </div>
    );
}

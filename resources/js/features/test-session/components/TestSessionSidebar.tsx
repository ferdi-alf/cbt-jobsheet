import { Button } from "@/Components/ui/button";
import { CheckCircle2, LayoutGrid, NotebookPen } from "lucide-react";
import type { TestQuestionItem } from "../types";
import TestQuestionPalette from "./TestQuestionPalette";

export default function TestSessionSidebar({
    questions,
    currentIndex,
    onJump,
    onSubmit,
    submitting,
}: {
    questions: TestQuestionItem[];
    currentIndex: number;
    onJump: (index: number) => void;
    onSubmit: () => void;
    submitting: boolean;
}) {
    return (
        <div className="space-y-5">
            <TestQuestionPalette
                questions={questions}
                currentIndex={currentIndex}
                onJump={onJump}
            />

            <div className="rounded-[28px] border bg-background/90 p-4 shadow-sm backdrop-blur-sm">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <NotebookPen className="h-4 w-4" />
                    Panduan singkat
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                    <div>Baca soal dengan teliti sebelum memilih jawaban.</div>
                    <div>
                        Gunakan navigasi nomor soal untuk berpindah lebih cepat.
                    </div>
                    <div>
                        Periksa kembali jawaban Anda sebelum menekan tombol
                        kirim.
                    </div>
                </div>

                <Button
                    className="mt-4 w-full"
                    onClick={onSubmit}
                    disabled={submitting}
                >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Selesai & kirim
                </Button>
            </div>
        </div>
    );
}

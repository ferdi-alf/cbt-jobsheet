import { Button } from "@/Components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import TimeUpDialog from "./TimeUpDialog";
import TestQuestionCard from "./TestQuestionCard";
import TestSessionHeader from "./TestSessionHeader";
import TestSessionSidebar from "./TestSessionSidebar";
import { useTestSession } from "../hooks/useTestSession";

export default function TestSessionScreen({
    publicKey,
}: {
    publicKey: string;
}) {
    const vm = useTestSession(publicKey);

    if (vm.loading) {
        return (
            <div className="min-h-screen bg-background px-4 py-10">
                <div className="mx-auto max-w-3xl rounded-[28px] border bg-background p-6 shadow-sm">
                    Memuat sesi test...
                </div>
            </div>
        );
    }

    if (vm.error || !vm.session || !vm.currentQuestion) {
        return (
            <div className="min-h-screen bg-background px-4 py-10">
                <div className="mx-auto max-w-3xl rounded-[28px] border bg-background p-6 text-destructive shadow-sm">
                    {vm.error ?? "Sesi test tidak ditemukan."}
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_28%),linear-gradient(to_bottom,rgba(248,250,252,0.98),rgba(255,255,255,1))] dark:bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_28%),linear-gradient(to_bottom,rgba(2,6,23,1),rgba(3,7,18,1))]">
            <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
            <TimeUpDialog open={vm.timeUpOpen} />

            <div className="relative mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-6">
                <TestSessionHeader
                    session={vm.session}
                    answeredCount={vm.answeredCount}
                    currentIndex={vm.currentIndex}
                    remainingSeconds={vm.remainingSeconds}
                    progressValue={vm.progressValue}
                />

                <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="space-y-4">
                        <TestQuestionCard
                            question={vm.currentQuestion}
                            direction={vm.direction}
                            onSelect={vm.selectAnswer}
                        />

                        <div className="rounded-[28px] border bg-background/90 p-4 shadow-sm backdrop-blur-sm">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={vm.prev}
                                    disabled={
                                        vm.currentIndex === 0 || vm.submitting
                                    }
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Sebelumnya
                                </Button>

                                <div className="text-center text-sm text-muted-foreground">
                                    Soal {vm.currentIndex + 1} dari{" "}
                                    {vm.session.total_questions}
                                </div>

                                {vm.isLastQuestion ? (
                                    <Button
                                        type="button"
                                        onClick={vm.submit}
                                        disabled={vm.submitting}
                                    >
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Selesai & kirim
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={vm.next}
                                        disabled={vm.submitting}
                                    >
                                        Berikutnya
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <TestSessionSidebar
                        questions={vm.session.questions}
                        currentIndex={vm.currentIndex}
                        answeredCount={vm.answeredCount}
                        totalQuestions={vm.session.total_questions}
                        onJump={vm.jumpTo}
                        onSubmit={vm.submit}
                        submitting={vm.submitting}
                    />
                </div>
            </div>
        </div>
    );
}

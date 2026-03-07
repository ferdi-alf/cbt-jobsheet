import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
import type {
    StartTestResponse,
    TestOptionValue,
    TestSessionData,
} from "../types";
import {
    saveTestAnswer,
    startOrResumeTest,
    submitTest,
} from "../api/testSession.api";
import {
    clearTestSnapshot,
    loadTestSnapshot,
    saveTestSnapshot,
} from "./useTestStorage";
import { useTestTimer } from "./useTestTimer";

function normalizeOptionValue(value?: string | null): TestOptionValue | null {
    if (!value) return null;

    const upper = String(value).trim().toUpperCase();
    return ["A", "B", "C", "D", "E"].includes(upper)
        ? (upper as TestOptionValue)
        : null;
}

function mergeSnapshot(session: TestSessionData, publicKey: string) {
    const snapshot = loadTestSnapshot(publicKey);

    const nextQuestions = session.questions.map((question) => {
        const serverAnswer = normalizeOptionValue(question.selected_option);
        const localAnswer = normalizeOptionValue(
            snapshot?.answers?.[question.id],
        );

        return {
            ...question,
            selected_option: serverAnswer ?? localAnswer,
        };
    });

    return {
        session: { ...session, questions: nextQuestions },
        currentIndex: Math.min(
            Math.max(0, snapshot?.currentIndex ?? 0),
            Math.max(0, nextQuestions.length - 1),
        ),
    };
}

export function useTestSession(publicKey: string) {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [timeUpOpen, setTimeUpOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [direction, setDirection] = useState<"next" | "prev">("next");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [session, setSession] = useState<TestSessionData | null>(null);
    const submittedRef = useRef(false);

    const boot = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const res = (await startOrResumeTest(
                publicKey,
            )) as StartTestResponse;
            if ("already_finished" in res) {
                router.visit(res.redirect_url, { replace: true });
                return;
            }

            const merged = mergeSnapshot(res, publicKey);
            setSession(merged.session);
            setCurrentIndex(merged.currentIndex);
        } catch (e: any) {
            const message = e?.message ?? "Gagal memuat sesi test.";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [publicKey]);

    useEffect(() => {
        void boot();
    }, [boot]);

    useEffect(() => {
        if (!session || submittedRef.current) return;

        const answers = session.questions.reduce<
            Record<number, TestOptionValue>
        >((acc, question) => {
            const normalized = normalizeOptionValue(question.selected_option);
            if (normalized) {
                acc[question.id] = normalized;
            }
            return acc;
        }, {});

        saveTestSnapshot(publicKey, {
            currentIndex,
            answers,
            expiresAt: session.expires_at,
            updatedAt: Date.now(),
        });
    }, [publicKey, currentIndex, session]);

    useEffect(() => {
        const onBeforeUnload = (event: BeforeUnloadEvent) => {
            if (!session || submittedRef.current) return;
            event.preventDefault();
            event.returnValue = "";
        };

        window.addEventListener("beforeunload", onBeforeUnload);
        return () => window.removeEventListener("beforeunload", onBeforeUnload);
    }, [session]);

    const { remainingSeconds, isExpired } = useTestTimer(session?.expires_at);

    const doSubmit = useCallback(async () => {
        if (!session || submitting) return;

        try {
            setSubmitting(true);
            submittedRef.current = true;

            const res = await submitTest(publicKey, {
                answers: session.questions.map((question) => ({
                    question_id: question.id,
                    selected_option: normalizeOptionValue(
                        question.selected_option,
                    ),
                })),
            });

            clearTestSnapshot(publicKey);
            router.visit(res.redirect_url, { replace: true });
        } catch (e: any) {
            submittedRef.current = false;
            toast.error(e?.message ?? "Gagal mengirim jawaban.");
        } finally {
            setSubmitting(false);
        }
    }, [publicKey, session, submitting]);

    useEffect(() => {
        if (!session || !isExpired || submitting || submittedRef.current)
            return;
        setTimeUpOpen(true);
        void doSubmit();
    }, [session, isExpired, submitting, doSubmit]);

    const selectAnswer = useCallback(
        async (value: TestOptionValue) => {
            if (!session || submitting) return;

            const selected = normalizeOptionValue(value);
            if (!selected) return;

            const question = session.questions[currentIndex];
            if (!question) return;

            setSession((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    questions: prev.questions.map((item) =>
                        item.id === question.id
                            ? { ...item, selected_option: selected }
                            : item,
                    ),
                };
            });

            try {
                await saveTestAnswer(publicKey, {
                    question_id: question.id,
                    selected_option: selected,
                });
            } catch (e: any) {
                toast.error(e?.message ?? "Gagal menyimpan jawaban.");
            }
        },
        [publicKey, session, currentIndex, submitting],
    );

    const jumpTo = useCallback(
        (index: number) => {
            setDirection(index > currentIndex ? "next" : "prev");
            setCurrentIndex(index);
        },
        [currentIndex],
    );

    const next = useCallback(() => {
        if (!session || currentIndex >= session.questions.length - 1) return;
        setDirection("next");
        setCurrentIndex((prev) => prev + 1);
    }, [session, currentIndex]);

    const prev = useCallback(() => {
        if (currentIndex <= 0) return;
        setDirection("prev");
        setCurrentIndex((prev) => prev - 1);
    }, [currentIndex]);

    const answeredCount = useMemo(
        () =>
            session?.questions.filter(
                (question) => !!normalizeOptionValue(question.selected_option),
            ).length ?? 0,
        [session],
    );

    const currentQuestion = session?.questions[currentIndex] ?? null;
    const progressValue = session
        ? Math.round(
              ((currentIndex + 1) / Math.max(1, session.total_questions)) * 100,
          )
        : 0;

    return {
        loading,
        submitting,
        timeUpOpen,
        error,
        direction,
        currentIndex,
        currentQuestion,
        session,
        answeredCount,
        progressValue,
        remainingSeconds,
        isLastQuestion:
            !!session && currentIndex === session.questions.length - 1,
        selectAnswer,
        jumpTo,
        next,
        prev,
        submit: doSubmit,
    };
}

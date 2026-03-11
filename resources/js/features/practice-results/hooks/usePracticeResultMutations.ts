import { toast } from "sonner";
import { useProgress } from "@/Components/progress/ProgressProvider";
import { useQueryClient } from "@tanstack/react-query";
import { gradePracticeResult } from "../api/practiceResults.api";
import type { GradePracticePayload } from "../types";

export function usePracticeResultMutations(
    onSuccess?: () => void | Promise<void>,
) {
    const qc = useQueryClient();
    const { start, finish, fail } = useProgress();

    const refreshPracticeTables = async () => {
        await Promise.all([
            qc.invalidateQueries({
                queryKey: ["practice-results-summary"],
            }),
            qc.invalidateQueries({
                predicate: (query) => {
                    const key = query.queryKey;
                    return (
                        Array.isArray(key) &&
                        key[0] === "table-data" &&
                        typeof key[1] === "string" &&
                        key[1].includes("/api/practice-results")
                    );
                },
            }),
            qc.invalidateQueries({
                predicate: (query) => {
                    const key = query.queryKey;
                    return (
                        Array.isArray(key) &&
                        (key[0] === "practice-result-detail" ||
                            key[0] === "practice-result-items" ||
                            key[0] === "practice-results-summary")
                    );
                },
            }),
        ]);
    };

    const grade = async (
        submissionId: number,
        payload: GradePracticePayload,
    ) => {
        try {
            start("Menyimpan penilaian praktik...");
            await gradePracticeResult(submissionId, payload);
            await refreshPracticeTables();
            finish();
            toast.success("Penilaian praktik berhasil disimpan");
            await onSuccess?.();
            return true;
        } catch (e: any) {
            fail();
            toast.error(e?.message ?? "Gagal menyimpan penilaian praktik");
            throw e;
        }
    };

    return { grade };
}

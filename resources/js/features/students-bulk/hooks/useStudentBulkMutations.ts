import { toast } from "sonner";
import { useProgress } from "@/Components/progress/ProgressProvider";
import { bulkCreateStudents } from "../api/studentsBulk.api";
import type { BulkStudentPayload } from "../types";

export function useStudentBulkMutations() {
    const { start, finish, fail } = useProgress();

    const submit = async (payload: BulkStudentPayload) => {
        try {
            start("Menambahkan siswa...");
            const res = await bulkCreateStudents(payload);
            finish();
            toast.success(`Berhasil menambahkan ${res.created_count} siswa`);
            return res;
        } catch (e: any) {
            fail();
            if (e?.status === 422 && e?.payload?.error === "VALIDATION_ERROR") {
                throw e;
            }

            toast.error(e?.message ?? "Gagal menambahkan siswa");
            throw e;
        }
    };

    return { submit };
}

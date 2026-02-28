import { toast } from "sonner";
import { useProgress } from "@/Components/progress/ProgressProvider";
import { deleteStudent, updateStudent } from "../api/students.api";
import type { StudentUpdatePayload } from "../types";
import { useQueryClient } from "@tanstack/react-query";

export function useStudentMutations(onDone?: () => void) {
    const { start, finish, fail } = useProgress();
    const qc = useQueryClient();

    const invalidate = async (studentId?: number) => {
        await qc.invalidateQueries({ queryKey: ["table-data"] });
        if (studentId) {
            await qc.invalidateQueries({
                queryKey: ["student-detail", studentId],
            });
        }
    };

    const update = async (id: number, payload: StudentUpdatePayload) => {
        try {
            start("Mengupdate siswa...");
            await updateStudent(id, payload);
            await invalidate(id);
            finish();
            toast.success("Siswa berhasil diupdate");
            onDone?.();
            return true;
        } catch (e: any) {
            fail();
            toast.error(e?.message ?? "Gagal mengupdate siswa");
            throw e;
        }
    };

    const remove = async (id: number) => {
        try {
            start("Menghapus siswa...");
            await deleteStudent(id);
            await invalidate();
            finish();
            toast.success("Siswa berhasil dihapus");
            onDone?.();
            return true;
        } catch (e: any) {
            fail();
            toast.error(e?.message ?? "Gagal menghapus siswa");
            throw e;
        }
    };

    return { update, remove };
}

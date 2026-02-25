import { api } from "@/lib/http";
import { BulkStudentPayload } from "../types";

export async function bulkCreateStudents(payload: BulkStudentPayload) {
    return api.post<{
        created_count: number;
        created: Array<{ id: number; email: string }>;
    }>("/api/students/bulk", payload);
}

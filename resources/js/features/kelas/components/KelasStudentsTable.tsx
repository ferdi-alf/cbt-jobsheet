import { DataTable } from "@/Components/data-table";
import type { StudentRow } from "../types";

export default function KelasStudentsTable({ kelasId }: { kelasId: number }) {
    const columns = [
        { key: "full_name", label: "Nama" },
        { key: "email", label: "Email" },
        { key: "nisn", label: "NISN" },
        { key: "gender", label: "Gender", align: "center" as const },
    ];

    return (
        <DataTable<StudentRow>
            fetchUrl={`/api/kelas/${kelasId}/students`}
            columns={columns as any}
            search={{
                enabled: true,
                placeholder: "Cari nama/email/nisn...",
                debounceMs: 300,
            }}
            pagination={{
                enabled: true,
                pageSize: 10,
                pageSizeOptions: [5, 10, 15, 20],
            }}
            striped
            emptyMessage="Belum ada siswa di kelas ini."
        />
    );
}

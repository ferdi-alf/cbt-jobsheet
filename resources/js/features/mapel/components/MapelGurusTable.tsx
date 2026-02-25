import { DataTable } from "@/Components/data-table";
import { Badge } from "@/Components/ui/badge";
import type { GuruRow } from "../types";

function formatGender(g?: string | null) {
    if (!g) return "-";
    if (g === "L") return "Laki-laki";
    if (g === "P") return "Perempuan";
    return g;
}

export default function MapelGurusTable({ mapelId }: { mapelId: number }) {
    const columns = [
        { key: "full_name", label: "Nama" },
        { key: "email", label: "Email" },
        { key: "nip", label: "NIP" },
        {
            key: "gender",
            label: "Gender",
            align: "center" as const,
            render: (v: string | null) => (
                <Badge variant="secondary">{formatGender(v)}</Badge>
            ),
        },
        { key: "kelas", label: "Kelas" },
    ];

    return (
        <DataTable<GuruRow>
            fetchUrl={`/api/mapels/${mapelId}/gurus`}
            columns={columns as any}
            search={{
                enabled: true,
                placeholder: "Cari guru...",
                debounceMs: 300,
            }}
            pagination={{
                enabled: true,
                pageSize: 10,
                pageSizeOptions: [5, 10, 15, 20],
            }}
            striped
            emptyMessage="Belum ada guru pada mapel ini."
        />
    );
}

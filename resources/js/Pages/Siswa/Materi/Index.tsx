import SiswaLayout from "@/Layouts/SiswaLayout";
import { Head } from "@inertiajs/react";
import MateriGrid from "@/features/siswa-materi/components/MateriGrid";

export default function SiswaMateriIndex() {
    return (
        <SiswaLayout>
            <Head title="Materi" />
            <MateriGrid />
        </SiswaLayout>
    );
}

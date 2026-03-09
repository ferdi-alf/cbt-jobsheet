import SiswaLayout from "@/Layouts/SiswaLayout";
import { Head } from "@inertiajs/react";
import SiswaMateriList from "@/features/siswa-materi/components/SiswaMateriList";

export default function SiswaMateriPage() {
    return (
        <SiswaLayout>
            <Head title="Materi Saya" />
            <SiswaMateriList />
        </SiswaLayout>
    );
}

import SiswaLayout from "@/Layouts/SiswaLayout";
import { Head } from "@inertiajs/react";
import PretestList from "@/features/siswa-pretest/components/PretestList";

export default function SiswaPretestPage() {
    return (
        <SiswaLayout>
            <Head title="Pretest" />
            <PretestList />
        </SiswaLayout>
    );
}

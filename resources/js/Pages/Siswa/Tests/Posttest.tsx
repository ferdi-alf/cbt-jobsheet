import SiswaLayout from "@/Layouts/SiswaLayout";
import { Head } from "@inertiajs/react";
import PosttestList from "@/features/siswa-posttest/components/PosttestList";

export default function SiswaPosttestPage() {
    return (
        <SiswaLayout>
            <Head title="Posttest" />
            <PosttestList />
        </SiswaLayout>
    );
}

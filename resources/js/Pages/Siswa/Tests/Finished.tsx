import { Head, usePage } from "@inertiajs/react";
import type { PageProps } from "@/types";
import TestResultSummary from "@/features/test-session/components/TestResultSummary";

type TestPageProps = PageProps & {
    publicKey: string;
};

export default function SiswaFinishedTestPage() {
    const { props } = usePage<TestPageProps>();

    return (
        <>
            <Head title="Hasil Test" />
            <TestResultSummary publicKey={props.publicKey} />
        </>
    );
}

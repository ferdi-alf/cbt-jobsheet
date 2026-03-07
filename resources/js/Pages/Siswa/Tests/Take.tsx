import { Head, usePage } from "@inertiajs/react";
import type { PageProps } from "@/types";
import TestSessionScreen from "@/features/test-session/components/TestSessionScreen";

type TestPageProps = PageProps & {
    publicKey: string;
};

export default function SiswaTakeTestPage() {
    const { props } = usePage<TestPageProps>();

    return (
        <>
            <Head title="Pengerjaan Test" />
            <TestSessionScreen publicKey={props.publicKey} />
        </>
    );
}

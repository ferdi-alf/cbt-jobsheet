import { Head, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import GuruLayout from "@/Layouts/GuruLayout";
import SiswaLayout from "@/Layouts/SiswaLayout";
import ProfilePageContent from "@/features/profile/components/ProfilePageContent";

export default function ProfileIndex() {
    const { props } = usePage<any>();
    const role = props.auth?.user?.role;

    const Layout =
        role === "admin"
            ? AdminLayout
            : role === "guru"
              ? GuruLayout
              : SiswaLayout;

    return (
        <Layout>
            <Head title="Profile" />
            <ProfilePageContent />
        </Layout>
    );
}

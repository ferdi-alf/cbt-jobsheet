import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head } from "@inertiajs/react";

export default function AdminDashboard() {
    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />

            <div className="space-y-4">
                <h1 className="text-xl font-semibold">Dashboard Admin</h1>
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">
                                Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold">
                            -
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">
                                Kelas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold">
                            -
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">
                                Materi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold">
                            -
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">
                            Ringkasan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        isi chart/summary
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import GuruLayout from "@/Layouts/GuruLayout";
import { Head } from "@inertiajs/react";

export default function GuruDashboard() {
    return (
        <GuruLayout>
            <Head title="Guru Dashboard" />

            <div className="space-y-4">
                <h1 className="text-xl font-semibold">Dashboard Guru</h1>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">
                                Siswa (Kelas yang di-handle)
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

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">
                                Test / Attempts
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
        </GuruLayout>
    );
}

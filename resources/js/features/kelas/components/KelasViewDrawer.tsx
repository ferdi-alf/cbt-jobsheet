import { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import BottomDrawerShell from "@/Components/drawers/shells/BottomDrawerShell";
import {
    getKelasOverview,
    getKelasMaterials,
    getKelasStudents,
} from "../api/kelas.api";

import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { FileText } from "lucide-react";
import TopPosttestBarChart from "./chart/TopPosttestBarChart";
import GenderPieChart from "./chart/GenderPieChart";
import KelasStudentsTable from "./KelasStudentsTable";

export default function KelasViewDrawer({
    kelasId,
    title,
    trigger,
}: {
    kelasId: number;
    title: string;
    trigger: ReactNode;
}) {
    return (
        <BottomDrawerShell title={title} trigger={trigger}>
            <KelasDrawerContent kelasId={kelasId} />
        </BottomDrawerShell>
    );
}

function KelasDrawerContent({ kelasId }: { kelasId: number }) {
    const overviewQ = useQuery({
        queryKey: ["kelas-overview", kelasId],
        queryFn: () => getKelasOverview(kelasId),
        staleTime: 60_000,
    });

    const materialsQ = useQuery({
        queryKey: ["kelas-materials", kelasId],
        queryFn: () => getKelasMaterials(kelasId),
        staleTime: 60_000,
    });

    const studentsQ = useQuery({
        queryKey: ["kelas-students", kelasId],
        queryFn: () => getKelasStudents(kelasId),
        staleTime: 60_000,
    });

    if (overviewQ.isLoading)
        return <div className="text-sm text-muted-foreground">Loading...</div>;
    if (overviewQ.error)
        return (
            <div className="text-sm text-destructive">
                {(overviewQ.error as Error).message}
            </div>
        );

    const o = overviewQ.data!;
    const materials = materialsQ.data ?? [];
    const students = studentsQ.data ?? [];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
                <div className="md:col-span-7">
                    <TopPosttestBarChart items={o.top_posttest ?? []} />
                </div>
                <div className="md:col-span-3">
                    <GenderPieChart
                        laki={o.gender.laki_laki}
                        perempuan={o.gender.perempuan}
                    />
                </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Total Siswa</CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-semibold">
                        {o.stats.total_students}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Guru Handle</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="text-3xl font-semibold">
                            {o.stats.total_guru}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {o.guru_list.length
                                ? "Daftar di bawah"
                                : "Belum ada guru"}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Daftar Guru</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                    {o.guru_list.length === 0 ? (
                        <div className="text-muted-foreground">
                            Belum ada guru yang meng-handle kelas ini.
                        </div>
                    ) : (
                        <ul className="space-y-1">
                            {o.guru_list.map((g) => (
                                <li
                                    key={g.id}
                                    className="flex items-center justify-between gap-3"
                                >
                                    <span className="truncate">
                                        <b>{g.full_name}</b>{" "}
                                        <span className="text-muted-foreground">
                                            ({g.nip})
                                        </span>
                                    </span>
                                    <span className="text-muted-foreground">
                                        {g.mapel ?? "-"}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Materi Kelas Ini</CardTitle>
                </CardHeader>
                <CardContent>
                    {materialsQ.isLoading ? (
                        <div className="text-sm text-muted-foreground">
                            Loading materi...
                        </div>
                    ) : materialsQ.error ? (
                        <div className="text-sm text-destructive">
                            {(materialsQ.error as Error).message}
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Materi</TableHead>
                                        <TableHead>Dibuat Oleh</TableHead>
                                        <TableHead className="text-right">
                                            Created At
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {materials.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={3}
                                                className="text-center text-sm text-muted-foreground"
                                            >
                                                Belum ada materi untuk kelas
                                                ini.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        materials.map((m) => (
                                            <TableRow key={m.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4" />
                                                        {m.pdf_url ? (
                                                            <a
                                                                className="underline"
                                                                href={m.pdf_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            >
                                                                {m.title}
                                                            </a>
                                                        ) : (
                                                            <span>
                                                                {m.title}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {m.created_by.name ??
                                                        m.created_by.email}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {m.created_at}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Daftar Siswa</CardTitle>
                </CardHeader>
                <CardContent>
                    <KelasStudentsTable kelasId={kelasId} />
                </CardContent>
            </Card>
        </div>
    );
}

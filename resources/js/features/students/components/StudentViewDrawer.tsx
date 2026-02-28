import { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import BottomDrawerShell from "@/Components/drawers/shells/BottomDrawerShell";
import { getStudentDetail } from "../api/students.api";
import UserAvatar from "@/Components/common/UserAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import StudentPosttestLineChart from "./chart/StudentPosttestLineChart";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import StudentPracticesTable from "./StudentPracticesTable";

export default function StudentViewDrawer({
    studentId,
    title,
    trigger,
}: {
    studentId: number;
    title: string;
    trigger: ReactNode;
}) {
    return (
        <BottomDrawerShell title={title} trigger={trigger}>
            <StudentDrawerContent studentId={studentId} />
        </BottomDrawerShell>
    );
}

function StudentDrawerContent({ studentId }: { studentId: number }) {
    const q = useQuery({
        queryKey: ["student-detail", studentId],
        queryFn: () => getStudentDetail(studentId),
        staleTime: 60_000,
    });

    if (q.isLoading)
        return <div className="text-sm text-muted-foreground">Loading...</div>;
    if (q.error)
        return (
            <div className="text-sm text-destructive">
                {(q.error as Error).message}
            </div>
        );

    const d = q.data!;
    const s = d.student;

    return (
        <div className="space-y-4">
            <Card>
                <CardContent className="p-4 flex items-center gap-4">
                    <UserAvatar
                        src={s.avatar_path ?? null}
                        name={s.full_name ?? s.email}
                        className="h-14 w-14"
                    />
                    <div className="min-w-0">
                        <div className="font-semibold truncate">
                            {s.full_name}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                            {s.email} • {s.kelas ?? "-"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                            Username: <b>{s.username ?? "-"}</b> • NISN:{" "}
                            <b>{s.nisn}</b>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                            Rata-rata Pretest
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-semibold">
                        {d.stats.avg_pretest}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                            Rata-rata Posttest
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-semibold">
                        {d.stats.avg_posttest}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
                <div className="md:col-span-7">
                    <StudentPosttestLineChart
                        items={d.chart.last_posttests ?? []}
                    />
                </div>
                <div className="md:col-span-3">
                    <Card className="h-full">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span>Gender</span>
                                <Badge variant="outline" className="capitalize">
                                    {s.gender}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>No. HP</span>
                                <span className="text-muted-foreground">
                                    {s.phone}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                        Riwayat Test (Pretest/Posttest)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tipe</TableHead>
                                    <TableHead>Materi</TableHead>
                                    <TableHead>Test</TableHead>
                                    <TableHead className="text-center">
                                        Score
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Selesai
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {d.tables.attempts.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center text-sm text-muted-foreground"
                                        >
                                            Belum ada attempt.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    d.tables.attempts.map((a) => (
                                        <TableRow key={a.id}>
                                            <TableCell className="capitalize">
                                                {a.type}
                                            </TableCell>
                                            <TableCell>
                                                {a.materi_title}
                                            </TableCell>
                                            <TableCell>
                                                {a.test_title}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary">
                                                    {a.score ?? 0}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {a.finished_at ?? "-"}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Riwayat Praktek</CardTitle>
                </CardHeader>
                <CardContent>
                    <StudentPracticesTable studentId={studentId} />
                </CardContent>
            </Card>
        </div>
    );
}

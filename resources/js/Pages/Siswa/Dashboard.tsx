import SiswaLayout from "@/Layouts/SiswaLayout";
import { Head } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import {
    BookOpen,
    CheckCircle2,
    Circle,
    Lock,
    FileText,
    BarChart2,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import UserAvatar from "@/Components/common/UserAvatar";

type Profile = {
    full_name: string;
    nisn: string;
    kelas: string;
    gender: string;
    email: string;
    avatar_path?: string | null;
};
type Progress = {
    pretest_done: boolean;
    pretest_score: number | null;
    posttest_done: boolean;
    posttest_score: number | null;
    praktik_submitted: number;
    praktik_total: number;
};
type MateriRow = {
    id: number;
    title: string;
    mapel: string;
    creator: string;
    created_at: string;
    has_practice: boolean;
    has_test: boolean;
};
type ScoreRow = { label: string; score: number; type: string; date: string };

interface Props {
    profile: Profile;
    progress: Progress;
    materis: MateriRow[];
    recentScores: ScoreRow[];
}

const steps = [
    {
        key: "pretest",
        label: "Pretest",
        desc: "Kerjakan tes awal untuk membuka akses materi",
        getScore: (p: Progress) => p.pretest_score,
        isDone: (p: Progress) => p.pretest_done,
        isLocked: (_: Progress) => false,
    },
    {
        key: "materi",
        label: "Materi",
        desc: "Pelajari jobsheet &amp; bahan ajar",
        getScore: (_: Progress) => null,
        isDone: (_: Progress) => false,
        isLocked: (p: Progress) => !p.pretest_done,
    },
    {
        key: "praktik",
        label: "Praktik",
        desc: "Upload bukti praktik sesuai checklist",
        getScore: (_: Progress) => null,
        isDone: (p: Progress) => p.praktik_submitted > 0,
        isLocked: (p: Progress) => !p.pretest_done,
        extra: (p: Progress) =>
            `${p.praktik_submitted}/${p.praktik_total} selesai`,
    },
    {
        key: "posttest",
        label: "Posttest",
        desc: "Evaluasi akhir setelah belajar",
        getScore: (p: Progress) => p.posttest_score,
        isDone: (p: Progress) => p.posttest_done,
        isLocked: (p: Progress) => !p.pretest_done,
    },
];

const ScoreBarTip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload as ScoreRow;
    return (
        <div className="rounded-lg border bg-background px-3 py-2 shadow-lg text-sm">
            <p className="font-medium">{d.label}</p>
            <p className="text-xs text-muted-foreground">{d.date}</p>
            <p className="font-bold text-blue-600">Nilai: {d.score}</p>
        </div>
    );
};

const genderLabel = (g: string) =>
    g === "laki-laki" ? "Laki-laki" : g === "perempuan" ? "Perempuan" : g;

export default function SiswaDashboard({
    profile,
    progress,
    materis,
    recentScores,
}: Props) {
    const { pretest_done } = progress;

    return (
        <SiswaLayout>
            <Head title="Dashboard Siswa" />
            <div className="space-y-5">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Halo, {profile.full_name}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Selamat datang di platform pembelajaran!
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
                    {/* Profile 35% */}
                    <Card className="md:col-span-4">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-4 mb-4">
                                <UserAvatar
                                    src={profile.avatar_path}
                                    name={profile.full_name}
                                    className="h-14 w-14 text-base"
                                />
                                <div className="min-w-0">
                                    <p className="font-semibold truncate">
                                        {profile.full_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {profile.email}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: "NISN", value: profile.nisn },
                                    { label: "Kelas", value: profile.kelas },
                                    {
                                        label: "Gender",
                                        value: genderLabel(profile.gender),
                                    },
                                    {
                                        label: "Status",
                                        Value: "phone",
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className="rounded-lg bg-muted/50 p-2.5"
                                    >
                                        <p className="text-xs text-muted-foreground">
                                            {item.label}
                                        </p>
                                        <div className="text-sm font-medium mt-0.5">
                                            {item.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Scores 65% */}
                    <Card className="md:col-span-6">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <BarChart2 className="h-4 w-4" />
                                Nilai Tes Terakhir
                                <span className="text-xs font-normal text-muted-foreground ml-1">
                                    (hanya nilai yang dipublikasikan)
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentScores.length === 0 ? (
                                <div className="h-40 flex flex-col items-center justify-center text-center gap-2">
                                    <BarChart2 className="h-8 w-8 text-muted-foreground/30" />
                                    <p className="text-sm text-muted-foreground">
                                        Belum ada nilai yang ditampilkan.
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Nilai akan muncul setelah tes selesai
                                        dan dipublikasikan guru.
                                    </p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={180}>
                                    <BarChart
                                        data={recentScores}
                                        margin={{
                                            top: 4,
                                            right: 8,
                                            left: -20,
                                            bottom: 0,
                                        }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                            className="stroke-muted"
                                        />
                                        <XAxis
                                            dataKey="label"
                                            tick={{ fontSize: 10 }}
                                        />
                                        <YAxis
                                            domain={[0, 100]}
                                            tick={{ fontSize: 11 }}
                                        />
                                        <Tooltip
                                            content={<ScoreBarTip />}
                                            cursor={{
                                                fill: "hsl(var(--muted))",
                                            }}
                                        />
                                        <Bar
                                            dataKey="score"
                                            fill="#3b82f6"
                                            radius={[5, 5, 0, 0]}
                                            maxBarSize={52}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Materi Kelasmu
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {!pretest_done ? (
                            <div className="px-5 py-10 text-center">
                                <Lock className="h-9 w-9 text-muted-foreground/30 mx-auto mb-2" />
                                <p className="text-sm font-medium">
                                    Materi terkunci
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Selesaikan pretest terlebih dahulu untuk
                                    mengakses materi.
                                </p>
                            </div>
                        ) : materis.length === 0 ? (
                            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                                Belum ada materi untuk kelasmu.
                            </p>
                        ) : (
                            <ul className="divide-y">
                                {materis.map((m) => (
                                    <li
                                        key={m.id}
                                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-500 dark:bg-rose-950">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium truncate">
                                                {m.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {m.mapel} · {m.creator} ·{" "}
                                                {m.created_at}
                                            </p>
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                            {m.has_test && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    Tes
                                                </Badge>
                                            )}
                                            {m.has_practice && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    Praktik
                                                </Badge>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </SiswaLayout>
    );
}

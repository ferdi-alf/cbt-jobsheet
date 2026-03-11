import AdminLayout from "@/Layouts/AdminLayout";
import { Head } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import {
    Users,
    GraduationCap,
    Building2,
    BookOpen,
    FileText,
    Clock,
    TrendingUp,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

type PosttestRow = { full_name: string; kelas: string; avg_score: number };
type GenderRow = { name: string; value: number; color: string };
type MateriRow = {
    title: string;
    created_at: string;
    creator: string;
    kelas: string;
    mapel: string;
};
type KelasRow = {
    kelas: string;
    total_siswa: number;
    avg_pretest: number | null;
    avg_posttest: number | null;
    praktik_selesai: number;
};
type ActivityRow = {
    student_name: string;
    type: string;
    materi: string;
    score: number;
    time: string;
};

interface Props {
    stats: {
        total_siswa: number;
        total_guru: number;
        total_kelas: number;
        total_materi: number;
    };
    top10Posttest: PosttestRow[];
    genderData: GenderRow[];
    materiThisMonth: MateriRow[];
    kelasSummary: KelasRow[];
    recentActivity: ActivityRow[];
}

function StatCard({
    label,
    value,
    icon,
    sub,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
    sub?: string;
}) {
    return (
        <div className="group relative overflow-hidden rounded-[28px] border bg-background p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/80 via-primary/40 to-transparent" />
            <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-primary/10 blur-3xl" />

            <Card className="border-0 shadow-none">
                <CardContent className="p-5 border-0">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-muted-foreground">
                                {label}
                            </p>
                            <p className="mt-1.5 text-3xl font-bold tabular-nums tracking-tight">
                                {value.toLocaleString()}
                            </p>
                            {sub && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {sub}
                                </p>
                            )}
                        </div>
                        <div className="rounded-lg border bg-muted/50 p-2.5 text-foreground shrink-0">
                            {icon}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

const scoreClass = (v: number | null) =>
    v == null
        ? "text-muted-foreground"
        : v >= 75
          ? "text-emerald-600 font-semibold"
          : v >= 60
            ? "text-amber-600  font-semibold"
            : "text-rose-600 font-semibold";

const BarTip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload as PosttestRow;
    return (
        <div className="rounded-lg border bg-background px-3 py-2 shadow-lg text-sm">
            <p className="font-semibold">{d.full_name}</p>
            <p className="text-muted-foreground text-xs">Kelas: {d.kelas}</p>
            <p className="text-blue-600 font-bold">Rata-rata: {d.avg_score}</p>
        </div>
    );
};

const PieTip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border bg-background px-3 py-2 shadow-lg text-sm">
            <p className="font-semibold">{payload[0].name}</p>
            <p
                style={{ color: payload[0].payload.color }}
                className="font-bold"
            >
                {payload[0].value} siswa
            </p>
        </div>
    );
};

const shorten = (s: string) => (s.length > 11 ? s.slice(0, 10) + "…" : s);

export default function AdminDashboard({
    stats,
    top10Posttest,
    genderData,
    materiThisMonth,
    kelasSummary,
    recentActivity,
}: Props) {
    return (
        <AdminLayout>
            <Head title="Dashboard Admin" />
            <div className="space-y-5">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Ringkasan data &amp; aktivitas platform
                    </p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        label="Total Siswa"
                        value={stats.total_siswa}
                        icon={<Users className="h-4 w-4" />}
                    />
                    <StatCard
                        label="Total Guru"
                        value={stats.total_guru}
                        icon={<GraduationCap className="h-4 w-4" />}
                    />
                    <StatCard
                        label="Total Kelas"
                        value={stats.total_kelas}
                        icon={<Building2 className="h-4 w-4" />}
                    />
                    <StatCard
                        label="Total Materi"
                        value={stats.total_materi}
                        icon={<BookOpen className="h-4 w-4" />}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
                    <Card className="lg:col-span-7">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Top 10 Siswa — Rata-rata Posttest Tertinggi
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {top10Posttest.length === 0 ? (
                                <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">
                                    Belum ada data posttest.
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart
                                        data={top10Posttest}
                                        margin={{
                                            top: 4,
                                            right: 8,
                                            left: -16,
                                            bottom: 0,
                                        }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                            className="stroke-muted"
                                        />
                                        <XAxis
                                            dataKey="full_name"
                                            tickFormatter={shorten}
                                            tick={{ fontSize: 11 }}
                                        />
                                        <YAxis
                                            domain={[0, 100]}
                                            tick={{ fontSize: 11 }}
                                        />
                                        <Tooltip
                                            content={<BarTip />}
                                            cursor={{
                                                fill: "hsl(var(--muted))",
                                            }}
                                        />
                                        <Bar
                                            dataKey="avg_score"
                                            fill="#3b82f6"
                                            radius={[5, 5, 0, 0]}
                                            maxBarSize={48}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pie 30% */}
                    <Card className="lg:col-span-3">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold">
                                Gender Siswa
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-2">
                            {genderData.every((g) => g.value === 0) ? (
                                <div className="h-44 flex items-center justify-center text-sm text-muted-foreground">
                                    Belum ada data.
                                </div>
                            ) : (
                                <>
                                    <ResponsiveContainer
                                        width="100%"
                                        height={160}
                                    >
                                        <PieChart>
                                            <Pie
                                                data={genderData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={44}
                                                outerRadius={68}
                                                dataKey="value"
                                                paddingAngle={3}
                                            >
                                                {genderData.map((g) => (
                                                    <Cell
                                                        key={g.name}
                                                        fill={g.color}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<PieTip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex gap-5">
                                        {genderData.map((g) => (
                                            <div
                                                key={g.name}
                                                className="flex items-center gap-1.5 text-xs"
                                            >
                                                <span
                                                    className="h-2.5 w-2.5 rounded-full"
                                                    style={{
                                                        background: g.color,
                                                    }}
                                                />
                                                <span className="text-muted-foreground">
                                                    {g.name}
                                                </span>
                                                <span className="font-semibold">
                                                    {g.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
                    <Card className="lg:col-span-4">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Materi Ditambahkan Bulan Ini
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 overflow-auto h-[300px]">
                            {materiThisMonth.length === 0 ? (
                                <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                                    Belum ada materi bulan ini.
                                </p>
                            ) : (
                                <ul className="divide-y p-4">
                                    {materiThisMonth.map((m, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start rounded-sm gap-3 px-5 shadow-md py-3"
                                        >
                                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-500 dark:bg-rose-950">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">
                                                    {m.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {m.kelas} · {m.mapel}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {m.creator} · {m.created_at}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-6">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                Ringkasan Performa Per Kelas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/40">
                                            {[
                                                "Kelas",
                                                "Siswa",
                                                "Avg Pretest",
                                                "Avg Posttest",
                                                "Praktik ✓",
                                            ].map((h) => (
                                                <th
                                                    key={h}
                                                    className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground first:pl-5"
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {kelasSummary.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="px-5 py-8 text-center text-muted-foreground text-sm"
                                                >
                                                    Belum ada data kelas.
                                                </td>
                                            </tr>
                                        ) : (
                                            kelasSummary.map((k, i) => (
                                                <tr
                                                    key={i}
                                                    className="hover:bg-muted/30 transition-colors"
                                                >
                                                    <td className="px-5 py-3 truncate font-medium">
                                                        {k.kelas}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {k.total_siswa}
                                                    </td>
                                                    <td
                                                        className={`px-4 py-3 ${scoreClass(k.avg_pretest)}`}
                                                    >
                                                        {k.avg_pretest ?? "—"}
                                                    </td>
                                                    <td
                                                        className={`px-4 py-3 ${scoreClass(k.avg_posttest)}`}
                                                    >
                                                        {k.avg_posttest ?? "—"}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {k.praktik_selesai}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity Full */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Aktivitas Tes Terbaru
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/40">
                                        {[
                                            "Siswa",
                                            "Tipe",
                                            "Materi",
                                            "Nilai",
                                            "Waktu",
                                        ].map((h) => (
                                            <th
                                                key={h}
                                                className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground first:pl-5 last:text-right last:pr-5"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {recentActivity.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-5 py-8 text-center text-sm text-muted-foreground"
                                            >
                                                Belum ada aktivitas.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentActivity.map((a, i) => (
                                            <tr
                                                key={i}
                                                className="hover:bg-muted/30 transition-colors"
                                            >
                                                <td className="px-5 py-3 font-medium">
                                                    {a.student_name}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant={
                                                            a.type === "Pretest"
                                                                ? "secondary"
                                                                : "default"
                                                        }
                                                        className="text-xs"
                                                    >
                                                        {a.type}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 max-w-[200px] truncate text-muted-foreground">
                                                    {a.materi}
                                                </td>
                                                <td
                                                    className={`px-4 py-3 font-semibold ${scoreClass(a.score)}`}
                                                >
                                                    {a.score}
                                                </td>
                                                <td className="px-4 py-3 text-right text-xs text-muted-foreground pr-5">
                                                    {a.time}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}

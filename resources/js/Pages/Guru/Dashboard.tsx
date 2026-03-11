import GuruLayout from "@/Layouts/GuruLayout";
import { Head } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import {
    Users,
    BookOpen,
    ClipboardCheck,
    TrendingUp,
    AlertCircle,
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
type UngradedRow = {
    id: number;
    student_name: string;
    materi: string;
    submitted_at: string;
    is_late: boolean;
};

interface Props {
    stats: { total_siswa: number; total_materi: number; total_praktik: number };
    top10Posttest: PosttestRow[];
    genderData: GenderRow[];
    ungradedSubmissions: UngradedRow[];
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
        <Card>
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground">{label}</p>
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
    );
}

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

export default function GuruDashboard({
    stats,
    top10Posttest,
    genderData,
    ungradedSubmissions,
}: Props) {
    return (
        <GuruLayout>
            <Head title="Dashboard Guru" />
            <div className="space-y-5">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Pantau perkembangan siswa di kelasmu
                    </p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        label="Siswa di Kelasmu"
                        value={stats.total_siswa}
                        icon={<Users className="h-4 w-4" />}
                    />
                    <StatCard
                        label="Materi Dibuat"
                        value={stats.total_materi}
                        icon={<BookOpen className="h-4 w-4" />}
                    />
                    <StatCard
                        label="Praktik Masuk"
                        value={stats.total_praktik}
                        icon={<ClipboardCheck className="h-4 w-4" />}
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
                    {/* Bar 70% */}
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
                                    Siswa di kelasmu belum ada yang mengerjakan
                                    posttest.
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
                                Gender Siswa (Kelasmu)
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

                {/* Ungraded Submissions Full */}
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                Praktik Menunggu Penilaian
                            </CardTitle>
                            {ungradedSubmissions.length > 0 && (
                                <Badge
                                    variant="destructive"
                                    className="text-xs"
                                >
                                    {ungradedSubmissions.length} belum dinilai
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {ungradedSubmissions.length === 0 ? (
                            <div className="px-5 py-10 text-center">
                                <ClipboardCheck className="h-9 w-9 text-muted-foreground/40 mx-auto mb-2" />
                                <p className="text-sm font-medium">
                                    Semua praktik sudah dinilai!
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Tidak ada submission yang menunggu
                                    penilaian.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/40">
                                            {[
                                                "Siswa",
                                                "Materi",
                                                "Dikumpulkan",
                                                "Status",
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
                                        {ungradedSubmissions.map((s) => (
                                            <tr
                                                key={s.id}
                                                className="hover:bg-muted/30 transition-colors"
                                            >
                                                <td className="px-5 py-3 font-medium">
                                                    {s.student_name}
                                                </td>
                                                <td className="px-4 py-3 max-w-[200px] truncate text-muted-foreground">
                                                    {s.materi}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">
                                                    {s.submitted_at}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {s.is_late ? (
                                                        <Badge
                                                            variant="destructive"
                                                            className="text-xs"
                                                        >
                                                            Terlambat
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            Tepat Waktu
                                                        </Badge>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </GuruLayout>
    );
}

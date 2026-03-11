import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getMateriTopStudents } from "../api/materi.api";

export default function MateriTopStudentsBarChart({
    materiId,
}: {
    materiId: number;
}) {
    const q = useQuery({
        queryKey: ["materi-top-students", materiId],
        queryFn: () => getMateriTopStudents(materiId),
        staleTime: 60_000,
    });

    const items = q.data ?? [];

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                    Top 5 Rata-rata Pretest & Posttest
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[260px]">
                {q.isLoading ? (
                    <div className="text-sm text-muted-foreground">
                        Memuat chart...
                    </div>
                ) : q.isError ? (
                    <div className="text-sm text-destructive">
                        Gagal memuat chart.
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                        Belum ada data.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={items}
                            margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="full_name"
                                tick={{ fontSize: 11 }}
                                interval={0}
                                angle={-15}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="avg_score" radius={[6, 6, 0, 0]} fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}

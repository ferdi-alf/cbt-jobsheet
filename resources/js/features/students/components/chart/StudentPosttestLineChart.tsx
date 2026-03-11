import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function StudentPosttestLineChart({
    items,
}: {
    items: Array<{ score: number; finished_at: string | null; materi: string }>;
}) {
    const data = items.map((x, idx) => ({
        name: x.materi?.length ? x.materi.slice(0, 12) : `#${idx + 1}`,
        score: x.score,
    }));

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                    Trend 10 Posttest Terakhir
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 10 }}
                            interval={0}
                        />
                        <YAxis />
                        <Tooltip />
                        <Line stroke="#3b82f6" dataKey="score" />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

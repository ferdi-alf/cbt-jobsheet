import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";

export default function TopPosttestBarChart({
    items,
}: {
    items: Array<{ siswa_id: number; name: string; score: number }>;
}) {
    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                    Top 5 Posttest Tertinggi
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={items}>
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11 }}
                            interval={0}
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar fill="#3b82f6" dataKey="score" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

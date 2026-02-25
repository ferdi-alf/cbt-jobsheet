import { PieChart, Pie, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";

export default function GenderPieChart({
    laki,
    perempuan,
}: {
    laki: number;
    perempuan: number;
}) {
    const data = [
        { name: "Laki-laki", value: laki, fill: "#3b82f6" },
        { name: "Perempuan", value: perempuan, fill: "#ec4899" },
    ];

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm">Gender</CardTitle>
            </CardHeader>
            <CardContent className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={80}
                            fill="#8884d8"
                        />
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

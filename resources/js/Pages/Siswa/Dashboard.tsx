import SiswaLayout from "@/Layouts/SiswaLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import { cn } from "@/lib/utils";
import { Badge } from "@/Components/ui/badge";
import { Card, CardContent } from "@/Components/ui/card";
import { BookOpen, ClipboardCheck, ClipboardList, Upload } from "lucide-react";

function ActionCard({
    href,
    icon,
    title,
    desc,
    locked,
    badge,
}: {
    href: string;
    icon: React.ReactNode;
    title: string;
    desc: string;
    locked?: boolean;
    badge?: string;
}) {
    const body = (
        <Card
            className={cn(
                "transition-colors",
                locked ? "opacity-50 cursor-not-allowed" : "hover:bg-muted/30",
            )}
        >
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5">{icon}</div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <div className="font-semibold">{title}</div>
                            {badge && <Badge variant="outline">{badge}</Badge>}
                            {locked && (
                                <Badge variant="secondary">Terkunci</Badge>
                            )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {desc}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    if (locked) return <div className="pointer-events-none">{body}</div>;
    return (
        <Link href={href} className="block">
            {body}
        </Link>
    );
}

export default function SiswaDashboard() {
    const page = usePage<any>();
    const user = page.props?.auth?.user ?? {};

    const pretestDone = Boolean(user?.pretest_done);

    const name =
        user?.siswaProfile?.full_name || user?.name || user?.email || "Siswa";

    return (
        <SiswaLayout>
            <Head title="Dashboard Siswa" />

            <div className="space-y-4">
                <div className="rounded-xl border bg-background p-4">
                    <div className="text-lg font-semibold">Halo, {name}</div>
                    <div className="text-sm text-muted-foreground">
                        Alur belajar: Pretest → Materi → Praktik → Posttest
                    </div>
                    <div className="mt-3">
                        <Badge variant={pretestDone ? "default" : "secondary"}>
                            Pretest: {pretestDone ? "Selesai" : "Belum"}
                        </Badge>
                        {!pretestDone && (
                            <div className="text-xs text-muted-foreground mt-2">
                                Materi/Praktik/Posttest akan terbuka setelah
                                pretest selesai.
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <ActionCard
                        href="/pretest"
                        icon={<ClipboardList className="h-5 w-5" />}
                        title="Pretest"
                        desc="Kerjakan pretest dulu sebelum akses materi."
                        badge="Step 1"
                    />

                    <ActionCard
                        href="/my-materi"
                        icon={<BookOpen className="h-5 w-5" />}
                        title="Materi"
                        desc="Akses jobsheet & materi."
                        badge="Step 2"
                        locked={!pretestDone}
                    />

                    <ActionCard
                        href="/upload-practice"
                        icon={<Upload className="h-5 w-5" />}
                        title="Upload Praktik"
                        desc="Upload bukti praktik sesuai checklist."
                        badge="Step 3"
                        locked={!pretestDone}
                    />

                    <ActionCard
                        href="/posttest"
                        icon={<ClipboardCheck className="h-5 w-5" />}
                        title="Posttest"
                        desc="Evaluasi akhir setelah belajar."
                        badge="Step 4"
                        locked={!pretestDone}
                    />
                </div>
            </div>
        </SiswaLayout>
    );
}

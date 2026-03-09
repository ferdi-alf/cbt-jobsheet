import { Badge } from "@/Components/ui/badge";
import { BookOpenText } from "lucide-react";
import { useSiswaMateris } from "../hooks/useSiswaMateris";
import SiswaMateriCard from "./SiswaMateriCard";

function SkeletonCard() {
    return (
        <div className="rounded-3xl border bg-background p-4 shadow-sm animate-pulse">
            <div className="h-5 w-2/3 rounded bg-muted" />
            <div className="mt-2 h-4 w-1/2 rounded bg-muted" />
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="h-16 rounded-2xl bg-muted" />
                <div className="h-16 rounded-2xl bg-muted" />
            </div>
        </div>
    );
}

export default function SiswaMateriList() {
    const q = useSiswaMateris();
    const total = q.data?.length ?? 0;
    const opened = q.data?.filter((item) => item.can_open).length ?? 0;

    return (
        <div className="space-y-4">
            <div className="rounded-3xl border bg-background p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <BookOpenText className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-lg font-semibold">
                                Materi Saya
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Materi akan terbuka setelah pretest untuk materi
                                tersebut selesai.
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:justify-end">
                        <Badge variant="outline">Total: {total}</Badge>
                        <Badge variant={opened ? "default" : "secondary"}>
                            Terbuka: {opened}
                        </Badge>
                    </div>
                </div>
            </div>

            {q.isLoading && (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            )}

            {q.isError && (
                <div className="rounded-2xl border bg-background p-4 text-sm text-destructive">
                    {q.error?.message ?? "Gagal memuat materi."}
                </div>
            )}

            {!q.isLoading && !q.isError && (q.data?.length ?? 0) === 0 && (
                <div className="rounded-2xl border bg-background p-4 text-sm text-muted-foreground">
                    Belum ada materi.
                </div>
            )}

            {!q.isLoading && !q.isError && (q.data?.length ?? 0) > 0 && (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {(q.data ?? []).map((item) => (
                        <SiswaMateriCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}

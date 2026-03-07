import { BookOpen } from "lucide-react";
import MateriCard from "./MateriCard";
import { useSiswaMateris } from "../hooks/useSiswaMateris";

function SkeletonCard() {
    return (
        <div className="rounded-xl border bg-background p-4 animate-pulse">
            <div className="h-4 w-2/3 bg-muted rounded mb-2" />
            <div className="h-3 w-1/2 bg-muted rounded mb-4" />
            <div className="h-20 bg-muted rounded" />
        </div>
    );
}

export default function MateriGrid() {
    const q = useSiswaMateris();

    return (
        <div className="space-y-4">
            <div className="rounded-xl border bg-background p-4">
                <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-lg font-semibold">Materi</div>
                        <div className="text-sm text-muted-foreground">
                            Materi akan terbuka setelah pretest materi tersebut
                            selesai.
                        </div>
                    </div>
                </div>
            </div>

            {q.isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            )}

            {q.isError && (
                <div className="rounded-xl border bg-background p-4 text-sm text-destructive">
                    {q.error?.message ?? "Gagal memuat materi."}
                </div>
            )}

            {!q.isLoading && !q.isError && (q.data?.length ?? 0) === 0 && (
                <div className="rounded-xl border bg-background p-4 text-sm text-muted-foreground">
                    Belum ada materi untuk kelas kamu.
                </div>
            )}

            {!q.isLoading && !q.isError && (q.data?.length ?? 0) > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(q.data ?? []).map((it) => (
                        <MateriCard key={it.id} item={it} />
                    ))}
                </div>
            )}
        </div>
    );
}

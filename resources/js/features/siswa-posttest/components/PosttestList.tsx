import { useEffect, useRef, useState } from "react";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";
import { CheckCircle2, ClipboardList, Search } from "lucide-react";
import { usePosttests } from "../hooks/usePosttests";
import PosttestCard from "./PosttestCard";

function SkeletonCard() {
    return (
        <div className="rounded-xl border bg-background p-4 animate-pulse">
            <div className="h-4 w-2/3 bg-muted rounded mb-2" />
            <div className="h-3 w-1/2 bg-muted rounded mb-4" />
            <div className="h-20 bg-muted rounded" />
        </div>
    );
}

export default function PosttestList() {
    const [search, setSearch] = useState("");
    const [debounced, setDebounced] = useState("");
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const t = window.setTimeout(() => setDebounced(search.trim()), 300);
        return () => window.clearTimeout(t);
    }, [search]);

    const q = usePosttests(debounced);

    useEffect(() => {
        const node = sentinelRef.current;
        if (!node) return;

        const observer = new IntersectionObserver((entries) => {
            const first = entries[0];
            if (
                first?.isIntersecting &&
                q.hasNextPage &&
                !q.isFetchingNextPage
            ) {
                q.fetchNextPage();
            }
        });

        observer.observe(node);
        return () => observer.disconnect();
    }, [q.hasNextPage, q.isFetchingNextPage, q.fetchNextPage]);

    const stats = q.stats;

    return (
        <div className="space-y-4">
            <div className="rounded-xl border bg-background p-4">
                <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                <ClipboardList className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-lg font-semibold">
                                    Daftar Posttest
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Posttest terbuka setelah pretest materi
                                    terkait selesai.
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Badge variant="outline">
                                Total: {stats.total}
                            </Badge>
                            <Badge
                                variant={
                                    stats.submitted > 0
                                        ? "default"
                                        : "secondary"
                                }
                            >
                                Selesai: {stats.submitted}
                            </Badge>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari judul posttest atau materi..."
                            className="pl-9"
                        />
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
                    {q.error?.message ?? "Gagal memuat posttest."}
                </div>
            )}

            {!q.isLoading && !q.isError && q.items.length === 0 && (
                <div className="rounded-xl border bg-background p-4 text-sm text-muted-foreground">
                    Belum ada posttest.
                </div>
            )}

            {!q.isLoading && !q.isError && q.items.length > 0 && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.items.map((it) => (
                            <PosttestCard key={it.id} item={it} />
                        ))}
                    </div>

                    <div ref={sentinelRef} className="h-2" />

                    {q.isFetchingNextPage && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <SkeletonCard />
                            <SkeletonCard />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

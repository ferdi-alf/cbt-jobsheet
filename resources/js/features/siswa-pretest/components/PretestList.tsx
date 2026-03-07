import { useMemo, useState, type ReactNode } from "react";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";
import PretestCard from "./PretestCard";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useWindowScrollLoadMore } from "../hooks/useWindowScrollLoadMore";
import { usePretests } from "../hooks/usePretests";
import {
    ClipboardList,
    CheckCircle2,
    PlayCircle,
    Search,
    Loader2,
    X,
} from "lucide-react";

function SkeletonCard() {
    return (
        <div className="rounded-3xl border bg-background p-4 shadow-sm animate-pulse">
            <div className="h-5 w-2/3 rounded bg-muted" />
            <div className="mt-2 h-4 w-1/2 rounded bg-muted" />
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="h-16 rounded-2xl bg-muted" />
                <div className="h-16 rounded-2xl bg-muted" />
                <div className="h-16 rounded-2xl bg-muted" />
                <div className="h-16 rounded-2xl bg-muted" />
            </div>
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value: number;
}) {
    return (
        <div className="rounded-2xl border bg-background p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <div className="text-sm text-muted-foreground">{label}</div>
                    <div className="mt-1 text-2xl font-semibold">{value}</div>
                </div>
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-muted">
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default function PretestList() {
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebouncedValue(search, 350);
    const q = usePretests(debouncedSearch);

    useWindowScrollLoadMore({
        enabled: !!q.hasNextPage,
        loading: q.isFetchingNextPage,
        onLoadMore: () => {
            if (!q.hasNextPage || q.isFetchingNextPage) return;
            void q.fetchNextPage();
        },
    });

    const items = q.items;
    const stats = q.stats;
    const loadedLabel = useMemo(() => {
        if (!q.meta) return "";
        return `Menampilkan ${items.length} dari ${q.meta.total} data`;
    }, [items.length, q.meta]);

    return (
        <div className="space-y-5">
            <div className="overflow-hidden rounded-[28px] border bg-background p-4 shadow-sm md:p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex size-12 min-h-12 min-w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <ClipboardList className="h-6 w-6" />
                        </div>

                        <div className="min-w-0">
                            <div className="text-lg font-semibold md:text-xl">
                                Daftar Pretest
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground md:text-[15px]">
                                Cari berdasarkan judul test atau nama materi.
                                Data di-load 8 per fetch, yang belum selesai
                                tampil lebih dulu.
                            </div>
                        </div>
                    </div>

                    <div className="relative w-full xl:w-[360px]">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari judul test atau nama materi..."
                            className="pl-9 pr-10"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md hover:bg-muted"
                                aria-label="Hapus pencarian"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                    <Badge variant="outline" className="shrink-0">
                        Total: {stats.total}
                    </Badge>
                    <Badge variant="secondary" className="shrink-0">
                        Belum: {stats.waiting}
                    </Badge>
                    <Badge variant="outline" className="shrink-0">
                        Berjalan: {stats.in_progress}
                    </Badge>
                    <Badge
                        variant={stats.submitted > 0 ? "default" : "secondary"}
                        className="shrink-0"
                    >
                        Selesai: {stats.submitted}
                    </Badge>
                </div>
            </div>

            {!q.isLoading && !q.isError && (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <StatCard
                        icon={<ClipboardList className="h-5 w-5" />}
                        label="Total pretest"
                        value={stats.total}
                    />
                    <StatCard
                        icon={<PlayCircle className="h-5 w-5" />}
                        label="Sedang berjalan"
                        value={stats.in_progress}
                    />
                    <StatCard
                        icon={<CheckCircle2 className="h-5 w-5" />}
                        label="Sudah selesai"
                        value={stats.submitted}
                    />
                </div>
            )}

            {loadedLabel && !q.isLoading && !q.isError && (
                <div className="text-sm text-muted-foreground">
                    {loadedLabel}
                </div>
            )}

            {q.isLoading && (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            )}

            {q.isError && (
                <div className="rounded-2xl border bg-background p-4 text-sm text-destructive shadow-sm">
                    {q.error?.message ?? "Gagal memuat pretest."}
                </div>
            )}

            {!q.isLoading && !q.isError && items.length === 0 && (
                <div className="rounded-2xl border bg-background p-5 text-sm text-muted-foreground shadow-sm">
                    {debouncedSearch
                        ? `Tidak ada pretest untuk kata kunci "${debouncedSearch}".`
                        : "Belum ada pretest untuk kelas Anda."}
                </div>
            )}

            {!q.isLoading && !q.isError && items.length > 0 && (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {items.map((item) => (
                        <PretestCard key={item.id} item={item} />
                    ))}
                </div>
            )}

            {q.isFetchingNextPage && (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            )}

            {!q.isLoading && q.hasNextPage && !q.isFetchingNextPage && (
                <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Scroll untuk memuat data berikutnya...
                </div>
            )}
        </div>
    );
}

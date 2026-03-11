import { useEffect, useMemo, useState } from "react";
import { Input } from "@/Components/ui/input";
import { Search } from "lucide-react";
import { useSiswaMateris } from "../hooks/useSiswaMateris";
import SiswaMateriCard from "./SiswaMateriCard";

export default function SiswaMateriList() {
    const [search, setSearch] = useState("");
    const [debounced, setDebounced] = useState("");

    useEffect(() => {
        const t = window.setTimeout(() => {
            setDebounced(search.trim());
        }, 300);

        return () => window.clearTimeout(t);
    }, [search]);

    const q = useSiswaMateris(debounced);

    const stats = useMemo(() => {
        const items = q.data ?? [];
        return {
            total: items.length,
            opened: items.filter((x) => x.can_open).length,
            locked: items.filter((x) => !x.can_open).length,
        };
    }, [q.data]);

    return (
        <div className="space-y-4">
            <div className="rounded-xl border bg-background p-4">
                <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <div className="text-lg font-semibold">
                                Materi Saya
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Materi terbuka setelah pretest materi terkait
                                selesai.
                            </div>
                        </div>

                        <div className="flex gap-2 text-sm">
                            <div className="rounded-lg border px-3 py-2">
                                Total: {stats.total}
                            </div>
                            <div className="rounded-lg border px-3 py-2">
                                Terbuka: {stats.opened}
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari judul materi, mapel, atau praktek..."
                            className="pl-9"
                        />
                    </div>
                </div>
            </div>

            {q.isLoading && (
                <div className="text-sm text-muted-foreground">
                    Memuat materi...
                </div>
            )}

            {q.isError && (
                <div className="rounded-xl border bg-background p-4 text-sm text-destructive">
                    {q.error?.message ?? "Gagal memuat materi."}
                </div>
            )}

            {!q.isLoading && !q.isError && (q.data?.length ?? 0) === 0 && (
                <div className="rounded-xl border bg-background p-4 text-sm text-muted-foreground">
                    Tidak ada materi yang cocok.
                </div>
            )}

            {!q.isLoading && !q.isError && (q.data?.length ?? 0) > 0 && (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {(q.data ?? []).map((item) => (
                        <SiswaMateriCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}

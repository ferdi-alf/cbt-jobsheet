import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/Components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { useBulkGroups } from "@/hooks/bulk/useBulkGroups";

type BulkHook<T> = ReturnType<typeof useBulkGroups<T>>;

export default function BulkGroups<T>({
    title = "Kelompok Input",
    addLabel = "Tambah Kelompok",
    itemsLabelPrefix = "Kelompok",
    bulk,
    renderItem,
    disableRemoveWhenOne = true,
    className,
}: {
    title?: string;
    addLabel?: string;
    itemsLabelPrefix?: string;
    bulk: BulkHook<T>;
    renderItem: (item: T, idx: number, api: BulkHook<T>) => ReactNode;
    disableRemoveWhenOne?: boolean;
    className?: string;
}) {
    const canRemove = !(disableRemoveWhenOne && bulk.items.length <= 1);

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center justify-between gap-3">
                <div className="font-semibold">{title}</div>
                <Button type="button" onClick={bulk.add}>
                    <Plus className="h-4 w-4 mr-2" />
                    {addLabel}
                </Button>
            </div>

            {bulk.items.map((item, idx) => {
                const hasErr = bulk.hasGroupError(idx);

                return (
                    <div
                        key={idx}
                        ref={bulk.setGroupRef(idx)}
                        data-bulk-group={idx}
                        className={cn(
                            "rounded-xl border bg-background p-4 space-y-3",
                            hasErr ? "border-destructive" : "border-border",
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <div className="font-medium">
                                {itemsLabelPrefix} #{idx + 1}
                            </div>

                            <Button
                                type="button"
                                variant="ghost"
                                className="text-destructive"
                                onClick={() => bulk.remove(idx)}
                                disabled={!canRemove}
                                title={
                                    !canRemove
                                        ? "Minimal 1 Siswa"
                                        : "Hapus kelompok"
                                }
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Hapus
                            </Button>
                        </div>

                        {renderItem(item, idx, bulk)}
                    </div>
                );
            })}
        </div>
    );
}

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/Components/ui/button";
import { Plus, Trash2 } from "lucide-react";

type BulkHook<T extends Record<string, any>> = {
    items: T[];
    setItems: React.Dispatch<React.SetStateAction<T[]>>;
    update: (index: number, patch: Partial<T>) => void;
    add: () => void;
    remove: (index: number) => void;
    errors: Record<string, string[]>;
    setErrors: (next: Record<string, string[]>) => void;
    clearErrors: () => void;
    getFieldError: (index: number, field: string) => string | null;
    hasGroupError: (index: number) => boolean;
    setGroupRef: (index: number, el: HTMLElement | null) => void;
    scrollToFirstError: (source?: Record<string, string[]>) => void;
    errorPrefix: string;
};

export default function BulkGroups<T extends Record<string, any>>({
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
                    <Plus className="mr-2 h-4 w-4" />
                    {addLabel}
                </Button>
            </div>

            {bulk.items.map((item, idx) => {
                const hasErr = bulk.hasGroupError(idx);

                return (
                    <div
                        key={idx}
                        ref={(el) => bulk.setGroupRef(idx, el)}
                        data-bulk-group-index={idx}
                        className={cn(
                            "space-y-3 rounded-xl border bg-background p-4",
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
                                        ? `Minimal 1 ${itemsLabelPrefix}`
                                        : "Hapus kelompok"
                                }
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
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

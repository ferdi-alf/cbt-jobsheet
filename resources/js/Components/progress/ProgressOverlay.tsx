import { Loader2 } from "lucide-react";
import { useProgress } from "./ProgressProvider";

export default function ProgressOverlay() {
    const { state } = useProgress();
    if (!state.open) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
            <div className="bg-background rounded-xl shadow-xl border p-6 w-[260px] text-center">
                <div className="flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
                <div className="mt-3 font-semibold">{state.percent}%</div>
                <div className="text-sm text-muted-foreground mt-1">
                    {state.label ?? "Memproses..."}
                </div>
            </div>
        </div>
    );
}

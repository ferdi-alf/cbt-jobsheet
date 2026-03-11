import { ReactNode, useState } from "react";
import EntityDrawer from "@/Components/drawers/EntityDrawer";
import { getPracticeResult } from "../api/practiceResults.api";
import type { PracticeResultDetail } from "../types";
import PracticeResultDrawerContent from "./PracticeResultDrawerContent";

export default function PracticeResultViewDrawer({
    submissionId,
    title,
    trigger,
    onGraded,
}: {
    submissionId: number;
    title: string;
    trigger: React.ReactNode;
    onGraded?: () => void | Promise<void>;
}) {
    const [open, setOpen] = useState(false);

    return (
        <EntityDrawer
            open={open}
            onOpenChange={setOpen}
            title={title}
            trigger={trigger}
            id={submissionId}
            fetcher={(id) => getPracticeResult(Number(id))}
            cacheKey={(id) => ["practice-result-detail", Number(id)]}
            render={({ data, loading, error }) => {
                if (loading) return <div className="text-sm">Loading...</div>;
                if (error) {
                    return (
                        <div className="text-sm text-destructive">{error}</div>
                    );
                }
                if (!data) {
                    return (
                        <div className="text-sm text-muted-foreground">
                            No data
                        </div>
                    );
                }

                return (
                    <PracticeResultDrawerContent
                        detail={data}
                        onSaved={async () => {
                            await onGraded?.();
                            setOpen(false);
                        }}
                    />
                );
            }}
        />
    );
}

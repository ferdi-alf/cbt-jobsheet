import { ReactNode, useState } from "react";
import EntityDrawer from "@/Components/drawers/EntityDrawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import TestOverviewPanel from "./TestOverviewPanel";
import TestQuestionsExpandable from "./TestQuestionsExpandable";

export default function TestViewDrawer({
    testId,
    title,
    trigger,
}: {
    testId: number;
    title: string;
    trigger: ReactNode;
}) {
    const [tab, setTab] = useState<"overview" | "questions">("overview");

    return (
        <EntityDrawer<any>
            variant="bottom"
            title={title}
            trigger={trigger}
            id={testId}
            render={() => (
                <div className="space-y-3">
                    <Tabs value={tab} onValueChange={(v: any) => setTab(v)}>
                        <TabsList className="sticky top-0 z-10 bg-background">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="questions">Soal</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-3">
                            <TestOverviewPanel testId={testId} />
                        </TabsContent>

                        <TabsContent value="questions" className="mt-3">
                            <TestQuestionsExpandable testId={testId} />
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        />
    );
}

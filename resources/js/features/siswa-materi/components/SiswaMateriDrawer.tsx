import type { ReactNode } from "react";
import { useState } from "react";
import EntityDrawer from "@/Components/drawers/EntityDrawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";

import type { SiswaMateriDetail } from "../types";
import PdfPagesTab from "./PdfPagesTab";
import { getSiswaMateri } from "../api/siswaMateris.api";
import PracticeTab from "./PracticeTab";

function DrawerContent({ materi }: { materi: SiswaMateriDetail }) {
    const [tab, setTab] = useState("pdf");

    return (
        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
            <div className="sticky top-0 z-10 border-b bg-background/95 pb-3 backdrop-blur">
                <div className="mb-2">
                    <div className="text-lg font-semibold">{materi.title}</div>
                    <div className="text-sm text-muted-foreground">
                        {materi.kelas} - {materi.mapel}
                    </div>
                </div>

                <TabsList>
                    <TabsTrigger value="pdf">PDF</TabsTrigger>
                    <TabsTrigger value="practice">Praktek</TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="pdf" className="mt-0">
                {tab === "pdf" && (
                    <PdfPagesTab
                        viewUrl={materi.pdf.view_url}
                        downloadUrl={materi.pdf.download_url ?? null}
                    />
                )}
            </TabsContent>

            <TabsContent value="practice" className="mt-0">
                {tab === "practice" && (
                    <PracticeTab
                        materiId={materi.id}
                        initial={materi.practice}
                    />
                )}
            </TabsContent>
        </Tabs>
    );
}

export default function SiswaMateriDrawer({
    materiId,
    trigger,
}: {
    materiId: number;
    trigger: ReactNode;
}) {
    return (
        <EntityDrawer<SiswaMateriDetail>
            variant="slide"
            title="Detail Materi"
            trigger={trigger}
            id={materiId}
            fetcher={(id) => getSiswaMateri(Number(id))}
            cacheKey={(id) => ["siswa-materi-detail", Number(id)]}
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
                            Data tidak tersedia.
                        </div>
                    );
                }
                return <DrawerContent materi={data} />;
            }}
        />
    );
}

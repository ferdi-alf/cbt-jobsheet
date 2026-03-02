import { ReactNode } from "react";
import EntityDrawer from "@/Components/drawers/EntityDrawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Button } from "@/Components/ui/button";
import { Download } from "lucide-react";

import { getMateri } from "../api/materi.api";
import type { MateriDetail } from "../types";
import PdfObjectViewer from "./PdfObjectViewer";
import MateriRelatedTab from "./MateriRelatedTab";

function MateriDrawerContent({ materi }: { materi: MateriDetail }) {
    const pdfViewUrl = materi.pdf?.url ?? null;
    const downloadUrl = materi.pdf?.download_url ?? null;

    return (
        <div className="space-y-4">
            {materi.praktik_text?.trim() && (
                <div className="rounded-xl border p-4">
                    <div className="font-semibold mb-1">Praktik</div>
                    <div className="text-sm text-muted-foreground whitespace-pre-line">
                        {materi.praktik_text}
                    </div>
                </div>
            )}

            <Tabs defaultValue="pdf">
                <div className="sticky top-0 z-10 bg-background border-b pb-2">
                    <TabsList>
                        <TabsTrigger value="pdf">PDF</TabsTrigger>
                        <TabsTrigger value="related">Terkait</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="pdf" className="mt-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-sm text-muted-foreground">
                            {materi.kelas} • {materi.mapel}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!downloadUrl}
                            onClick={() =>
                                downloadUrl &&
                                window.open(downloadUrl, "_blank")
                            }
                        >
                            Download
                        </Button>
                    </div>

                    {!pdfViewUrl ? (
                        <div className="text-sm text-muted-foreground">
                            PDF tidak tersedia.
                        </div>
                    ) : (
                        <PdfObjectViewer url={pdfViewUrl} />
                    )}
                </TabsContent>

                <TabsContent value="related" className="mt-4">
                    <MateriRelatedTab materiId={materi.id} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default function MateriViewDrawer({
    materiId,
    trigger,
    title,
}: {
    materiId: number;
    trigger: ReactNode;
    title: string;
}) {
    return (
        <EntityDrawer<MateriDetail>
            variant="bottom"
            title={title}
            trigger={trigger}
            id={materiId}
            fetcher={(id) => getMateri(Number(id))}
            cacheKey={(id) => ["materi-detail", Number(id)]}
            render={({ data, loading, error }) => {
                if (loading) return <div className="text-sm">Loading...</div>;
                if (error)
                    return (
                        <div className="text-sm text-destructive">{error}</div>
                    );
                if (!data)
                    return (
                        <div className="text-sm text-muted-foreground">
                            No data
                        </div>
                    );
                return <MateriDrawerContent materi={data} />;
            }}
        />
    );
}

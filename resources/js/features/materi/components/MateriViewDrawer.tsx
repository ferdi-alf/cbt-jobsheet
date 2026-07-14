import { ReactNode, useState } from "react";
import EntityDrawer from "@/Components/drawers/EntityDrawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Button } from "@/Components/ui/button";
import { FileArchive } from "lucide-react";
import { downloadFile } from "@/lib/download";

import { getMateri } from "../api/materi.api";
import type { MateriDetail } from "../types";
import MateriFileViewer from "@/Components/common/MateriFileViewer";
import MateriRelatedTab from "./MateriRelatedTab";
import { toast } from "sonner";

function MateriDrawerContent({ materi }: { materi: MateriDetail }) {
    const pdfViewUrl = materi.pdf?.url ?? null;
    const downloadUrl = materi.pdf?.download_url ?? null;
    const fileExt = materi.pdf?.ext ?? null;
    const exportZipUrl = materi.export_results_zip_url ?? null;
    const [downloadingZip, setDownloadingZip] = useState(false);

    return (
        <div className="space-y-4">
            {(materi.elemen?.trim() || materi.tujuan_pembelajaran?.trim()) && (
                <div className="rounded-xl border p-4 space-y-3">
                    {materi.elemen?.trim() && (
                        <div>
                            <div className="mb-1 font-semibold text-sm">
                                Elemen
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {materi.elemen}
                            </div>
                        </div>
                    )}
                    {materi.tujuan_pembelajaran?.trim() && (
                        <div>
                            <div className="mb-1 font-semibold text-sm">
                                Tujuan Pembelajaran
                            </div>
                            <div className="whitespace-pre-line text-sm text-muted-foreground">
                                {materi.tujuan_pembelajaran}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {materi.praktik_text?.trim() && (
                <div className="rounded-xl border p-4">
                    <div className="mb-1 font-semibold">Praktik</div>
                    <div className="whitespace-pre-line text-sm text-muted-foreground">
                        {materi.praktik_text}
                    </div>
                </div>
            )}

            {materi.k3_alat_bahan?.trim() && (
                <div className="rounded-xl border p-4">
                    <div className="mb-1 font-semibold">K3 dan APD</div>
                    <div className="whitespace-pre-line text-sm text-muted-foreground">
                        {materi.k3_alat_bahan}
                    </div>
                </div>
            )}

            <Tabs defaultValue="pdf">
                <div className="sticky top-0 z-10 border-b bg-background pb-2">
                    <div className="flex items-center justify-between gap-3">
                        <TabsList>
                            <TabsTrigger value="pdf">Materi</TabsTrigger>
                            <TabsTrigger value="related">Terkait</TabsTrigger>
                        </TabsList>

                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!exportZipUrl || downloadingZip}
                            onClick={async () => {
                                if (!exportZipUrl) return;
                                try {
                                    setDownloadingZip(true);
                                    toast.loading("Menyiapkan ZIP hasil...", {
                                        id: "drawer-download-zip",
                                    });
                                    await downloadFile(
                                        exportZipUrl,
                                        `${materi.title || "materi"}-hasil.zip`,
                                    );
                                    toast.success("Download dimulai", {
                                        id: "drawer-download-zip",
                                    });
                                } catch (e: any) {
                                    toast.error(
                                        e?.message ?? "Gagal download ZIP",
                                        { id: "drawer-download-zip" },
                                    );
                                } finally {
                                    setDownloadingZip(false);
                                }
                            }}
                        >
                            <FileArchive className="mr-2 h-4 w-4" />
                            {downloadingZip
                                ? "Menyiapkan..."
                                : "Unduh Hasil ZIP"}
                        </Button>
                    </div>
                </div>

                <TabsContent value="pdf" className="mt-4 space-y-3">
                    <div className="text-sm text-muted-foreground">
                        {materi.kelas} • {materi.mapel}
                    </div>

                    <MateriFileViewer
                        viewUrl={pdfViewUrl}
                        downloadUrl={downloadUrl}
                        ext={fileExt}
                    />
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
                return <MateriDrawerContent materi={data} />;
            }}
        />
    );
}

import { useEffect, useRef, useState } from "react";
import { Button } from "@/Components/ui/button";
import { Download } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export default function PdfPagesTab({
    viewUrl,
    downloadUrl,
}: {
    viewUrl: string;
    downloadUrl: string | null;
}) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [pageWidth, setPageWidth] = useState(760);
    const [numPages, setNumPages] = useState(0);

    useEffect(() => {
        const node = containerRef.current;
        if (!node) return;

        const updateWidth = () => {
            const next = Math.min(860, Math.max(280, node.clientWidth - 32));
            setPageWidth(next);
        };

        updateWidth();
        const observer = new ResizeObserver(updateWidth);
        observer.observe(node);

        return () => observer.disconnect();
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground">
                    Scroll untuk membaca PDF per halaman.
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={!downloadUrl}
                    onClick={() =>
                        downloadUrl && window.open(downloadUrl, "_blank")
                    }
                >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                </Button>
            </div>

            <div
                ref={containerRef}
                className="rounded-3xl border bg-muted/20 py-2 sm:py-4 sm:p-4"
            >
                <Document
                    file={viewUrl}
                    loading={<div className="p-6 text-sm">Memuat PDF...</div>}
                    onLoadSuccess={({ numPages: loaded }) =>
                        setNumPages(loaded)
                    }
                    error={
                        <div className="p-6 text-sm text-destructive">
                            Gagal memuat PDF.
                        </div>
                    }
                >
                    <div className="space-y-6">
                        {Array.from(
                            { length: numPages },
                            (_, idx) => idx + 1,
                        ).map((pageNumber) => (
                            <div
                                key={pageNumber}
                                className="mx-auto w-fit rounded-[28px] bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
                            >
                                <Page
                                    pageNumber={pageNumber}
                                    width={pageWidth}
                                    renderAnnotationLayer
                                    renderTextLayer
                                    loading={
                                        <div className="p-8 text-sm">
                                            Memuat halaman...
                                        </div>
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </Document>
            </div>
        </div>
    );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/Components/ui/button";
import { Download, FileText, FileImage, FileType2 } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const IMAGE_EXT = ["png", "jpg", "jpeg", "gif", "webp", "bmp"];

function resolveExt(url: string | null, ext?: string | null): string {
    if (ext) return ext.toLowerCase();
    if (!url) return "";
    const clean = url.split("?")[0].split("#")[0];
    const match = clean.match(/\.([a-z0-9]+)$/i);
    return match ? match[1].toLowerCase() : "";
}

/**
 * Penampil file materi serba-guna.
 * - PDF  → dirender per halaman (react-pdf)
 * - Gambar (png/jpg/dll) → ditampilkan langsung
 * - Word / PPT / lainnya → kartu unduh (tidak bisa dipratinjau di browser)
 */
export default function MateriFileViewer({
    viewUrl,
    downloadUrl,
    ext,
}: {
    viewUrl: string | null;
    downloadUrl: string | null;
    ext?: string | null;
}) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [pageWidth, setPageWidth] = useState(760);
    const [numPages, setNumPages] = useState(0);

    const kind = useMemo(() => resolveExt(viewUrl, ext), [viewUrl, ext]);
    const isPdf = kind === "pdf";
    const isImage = IMAGE_EXT.includes(kind);

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

    const downloadBtn = (
        <Button
            variant="outline"
            size="sm"
            disabled={!downloadUrl}
            onClick={() => downloadUrl && window.open(downloadUrl, "_blank")}
        >
            <Download className="mr-2 h-4 w-4" />
            Download
        </Button>
    );

    if (!viewUrl) {
        return (
            <div className="text-sm text-muted-foreground">
                File materi tidak tersedia.
            </div>
        );
    }

    const hint = isPdf
        ? "Scroll untuk membaca materi per halaman."
        : isImage
          ? "Gambar materi."
          : "Format ini tidak bisa dipratinjau di browser — silakan unduh.";

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground">{hint}</div>
                {downloadBtn}
            </div>

            <div
                ref={containerRef}
                className="rounded-3xl border bg-muted/20 p-3 sm:p-4"
            >
                {isPdf && (
                    <Document
                        file={viewUrl}
                        loading={
                            <div className="p-6 text-sm">Memuat PDF...</div>
                        }
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
                )}

                {isImage && (
                    <div className="flex justify-center">
                        <img
                            src={viewUrl}
                            alt="Materi"
                            className="max-w-full rounded-2xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
                        />
                    </div>
                )}

                {!isPdf && !isImage && (
                    <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
                        {["doc", "docx"].includes(kind) ? (
                            <FileText className="h-10 w-10 text-blue-600" />
                        ) : ["ppt", "pptx"].includes(kind) ? (
                            <FileType2 className="h-10 w-10 text-orange-600" />
                        ) : (
                            <FileImage className="h-10 w-10 text-muted-foreground" />
                        )}
                        <div className="text-sm text-muted-foreground">
                            File{" "}
                            <span className="font-medium uppercase">
                                {kind || "materi"}
                            </span>{" "}
                            tidak dapat ditampilkan langsung di browser.
                        </div>
                        {downloadBtn}
                    </div>
                )}
            </div>
        </div>
    );
}

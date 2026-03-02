import { cn } from "@/lib/utils";

export default function PdfObjectViewer({
    url,
    className,
}: {
    url: string;
    className?: string;
}) {
    const viewUrl = url.includes("#") ? url : `${url}#toolbar=1&navpanes=0`;

    return (
        <div
            className={cn(
                "rounded-xl border overflow-hidden bg-muted/20",
                className,
            )}
        >
            <object
                data={viewUrl}
                type="application/pdf"
                className="w-full h-[70vh]"
                aria-label="PDF preview"
            >
                <div className="p-4 text-sm">
                    Browser kamu tidak mendukung preview PDF.
                    <div className="mt-2">
                        <a
                            className="underline"
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Buka PDF
                        </a>
                    </div>
                </div>
            </object>
        </div>
    );
}

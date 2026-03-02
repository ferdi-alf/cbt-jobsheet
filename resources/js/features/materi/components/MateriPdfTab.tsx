import { Button } from "@/Components/ui/button";
import { Download } from "lucide-react";
import PdfObjectViewer from "./PdfObjectViewer";

export default function MateriPdfTab({ url }: { url: string | null }) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground">Preview PDF</div>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={!url}
                    onClick={() => url && window.open(url, "_blank")}
                >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                </Button>
            </div>

            {!url ? (
                <div className="text-sm text-muted-foreground">
                    PDF tidak tersedia.
                </div>
            ) : (
                <PdfObjectViewer url={url} />
            )}
        </div>
    );
}

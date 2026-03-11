import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";
import { Skeleton } from "@/Components/ui/skeleton";

export default function PracticeResultPhotoDialog({ url }: { url: string }) {
    const [open, setOpen] = useState(false);
    const [thumbLoading, setThumbLoading] = useState(true);
    const [dialogLoading, setDialogLoading] = useState(true);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="group relative h-32 w-32 overflow-hidden rounded-2xl border bg-muted/20 shadow-sm"
                >
                    {thumbLoading && <Skeleton className="absolute inset-0" />}
                    <img
                        src={url}
                        alt="Practice upload"
                        className="h-full w-full object-cover"
                        onLoad={() => setThumbLoading(false)}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                        Klik untuk melihat foto
                    </div>
                </button>
            </DialogTrigger>

            <DialogContent className="max-w-4xl w-[92vw]">
                <DialogHeader>
                    <DialogTitle>Foto Praktek</DialogTitle>
                </DialogHeader>

                <div className="relative">
                    {dialogLoading && (
                        <Skeleton
                            className="w-full rounded-xl"
                            style={{ height: "78vh" }}
                        />
                    )}
                    <img
                        loading="lazy"
                        src={url}
                        alt="Practice preview"
                        className="max-h-[78vh] w-full rounded-xl object-contain"
                        onLoad={() => setDialogLoading(false)}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}

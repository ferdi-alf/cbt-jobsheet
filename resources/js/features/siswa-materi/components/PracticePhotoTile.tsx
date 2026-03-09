import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/Components/ui/button";

type PhotoLike = {
    id: number | string;
    view_url: string;
    isUploading?: boolean;
};

export default function PracticePhotoTile({
    photo,
    disabled,
    onDelete,
}: {
    photo: PhotoLike;
    disabled?: boolean;
    onDelete: (id: number | string) => void;
}) {
    const uploading = photo.isUploading === true;

    return (
        <div className="group relative h-32 w-32 overflow-hidden rounded-2xl border bg-muted/20 shadow-sm">
            <img
                src={photo.view_url}
                alt="Practice upload"
                className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-black/40 opacity-0 transition group-hover:opacity-100" />

            {uploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-white">
                    <Loader2 className="h-5 w-5 animate-spin" />
                </div>
            ) : !disabled ? (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                    <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="h-9 w-9 rounded-full"
                        onClick={() => onDelete(photo.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ) : null}
        </div>
    );
}

import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Switch } from "@/Components/ui/switch";

export type MateriOption = {
    id: number;
    title: string;
    kelas?: string | null;
    mapel?: string | null;
};

export type FormState = {
    materi_id: string;
    type: "pretest" | "posttest";
    title: string;
    duration_minutes: "30" | "60" | "90" | "120";
    start_at: string;
    end_at: string;
    is_score_visible: boolean;
};

export default function TestFormFields({
    form,
    set,
    materis,
    formErrors,
}: {
    form: FormState;
    set: (k: keyof FormState, v: any) => void;
    materis: {
        isLoading: boolean;
        isError: boolean;
        error?: any;
        data?: MateriOption[];
    };
    formErrors: Record<string, string[]>;
}) {
    const getErr = (k: string) => formErrors?.[k]?.[0] ?? null;

    return (
        <div className="grid gap-3 text-start">
            <div className="grid gap-2">
                <Label>Materi</Label>
                <Select
                    value={form.materi_id}
                    onValueChange={(v) => set("materi_id", v)}
                >
                    <SelectTrigger
                        className={
                            getErr("materi_id") ? "border-destructive" : ""
                        }
                    >
                        <SelectValue
                            placeholder={
                                materis.isLoading
                                    ? "Loading..."
                                    : materis.isError
                                      ? "Gagal memuat materi"
                                      : "Pilih materi"
                            }
                        />
                    </SelectTrigger>
                    <SelectContent>
                        {(materis.data ?? []).map((m) => (
                            <SelectItem key={m.id} value={String(m.id)}>
                                {m.title} ({m.kelas ?? "-"} / {m.mapel ?? "-"})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {getErr("materi_id") && (
                    <div className="text-sm text-destructive">
                        {getErr("materi_id")}
                    </div>
                )}
                {materis.isError && (
                    <div className="text-sm text-destructive">
                        {materis.error?.message ?? "Gagal memuat materi"}
                    </div>
                )}
            </div>

            <div className="grid gap-2">
                <Label>Judul</Label>
                <Input
                    value={form.title}
                    onChange={(e) => set("title", e.target.value)}
                    className={getErr("title") ? "border-destructive" : ""}
                />
                {getErr("title") && (
                    <div className="text-sm text-destructive">
                        {getErr("title")}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                    <Label>Tipe</Label>
                    <Select
                        value={form.type}
                        onValueChange={(v: any) => set("type", v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih tipe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pretest">Pretest</SelectItem>
                            <SelectItem value="posttest">Posttest</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label>Durasi</Label>
                    <Select
                        value={form.duration_minutes}
                        onValueChange={(v: any) => set("duration_minutes", v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih durasi" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="30">30 menit</SelectItem>
                            <SelectItem value="60">60 menit</SelectItem>
                            <SelectItem value="90">90 menit</SelectItem>
                            <SelectItem value="120">120 menit</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-2">
                <Label>Start At</Label>
                <Input
                    type="datetime-local"
                    value={form.start_at}
                    onChange={(e) => set("start_at", e.target.value)}
                    className={getErr("start_at") ? "border-destructive" : ""}
                />
                {getErr("start_at") && (
                    <div className="text-sm text-destructive">
                        {getErr("start_at")}
                    </div>
                )}
            </div>

            <div className="grid gap-2">
                <Label>End At</Label>
                <Input
                    type="datetime-local"
                    value={form.end_at}
                    onChange={(e) => set("end_at", e.target.value)}
                    className={getErr("end_at") ? "border-destructive" : ""}
                />
                {getErr("end_at") && (
                    <div className="text-sm text-destructive">
                        {getErr("end_at")}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-1">
                    <div className="font-medium">Nilai Ditampilkan</div>
                    <div className="text-sm text-muted-foreground">
                        Jika off, siswa tidak melihat nilai.
                    </div>
                </div>
                <Switch
                    checked={form.is_score_visible}
                    onCheckedChange={(v) => set("is_score_visible", v)}
                />
            </div>
        </div>
    );
}

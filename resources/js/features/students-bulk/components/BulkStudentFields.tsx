import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import type { BulkStudentInput } from "../types";
import type { useBulkGroups } from "@/hooks/bulk/useBulkGroups";

type BulkHook = ReturnType<typeof useBulkGroups<BulkStudentInput>>;

const FIELDS: {
    key: keyof BulkStudentInput;
    label: string;
    required?: boolean;
    hint: string;
    type?: string;
}[] = [
    {
        key: "nisn",
        label: "NISN",
        required: true,
        hint: "Nomor Induk Siswa Nasional — wajib diisi, harus unik.",
    },
    {
        key: "full_name",
        label: "Nama Lengkap",
        required: true,
        hint: "Nama siswa sesuai dokumen resmi.",
    },
    {
        key: "username",
        label: "Username",
        hint: "Opsional. Jika kosong, dibuat otomatis dari NISN (siswa_[nisn]).",
    },
    {
        key: "email",
        label: "Email",
        hint: "Opsional. Jika kosong, dibuat otomatis ([nisn]@student.local).",
    },
    {
        key: "password",
        label: "Password",
        type: "password",
        hint: "Opsional. Jika kosong, NISN digunakan sebagai password awal.",
    },
    {
        key: "phone",
        label: "No. HP",
        hint: "Opsional. Nomor telepon siswa.",
    },
];

export default function BulkStudentFields({
    item,
    idx,
    bulk,
}: {
    item: BulkStudentInput;
    idx: number;
    bulk: BulkHook;
}) {
    const err = (field: keyof BulkStudentInput) =>
        bulk.getFieldError(idx, field);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FIELDS.map(({ key, label, required, hint, type }) => (
                <div key={key} className="space-y-1">
                    <Label>
                        {label}
                        {required ? (
                            <span className="text-destructive ml-1">*</span>
                        ) : (
                            <span className="ml-1 text-xs font-normal text-muted-foreground">
                                (opsional)
                            </span>
                        )}
                    </Label>
                    <Input
                        type={type ?? "text"}
                        value={(item[key] as string) ?? ""}
                        onChange={(e) =>
                            bulk.update(idx, { [key]: e.target.value } as any)
                        }
                        className={cn(err(key) && "border-destructive")}
                        placeholder={
                            required
                                ? `Masukkan ${label.toLowerCase()}...`
                                : "Biarkan kosong untuk auto-generate"
                        }
                    />
                    <p className="text-[11px] text-muted-foreground leading-tight">
                        {hint}
                    </p>
                    {err(key) && (
                        <div className="text-xs text-destructive">
                            {err(key)}
                        </div>
                    )}
                </div>
            ))}

            <div className="space-y-1">
                <Label>
                    Jenis Kelamin
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                        (opsional)
                    </span>
                </Label>
                <Select
                    value={item.gender || ""}
                    onValueChange={(v) =>
                        bulk.update(idx, { gender: v as any })
                    }
                >
                    <SelectTrigger
                        className={cn(err("gender") && "border-destructive")}
                    >
                        <SelectValue placeholder="Default: laki-laki" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="laki-laki">Laki-laki</SelectItem>
                        <SelectItem value="perempuan">Perempuan</SelectItem>
                    </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                    Opsional. Default laki-laki jika tidak dipilih.
                </p>
                {err("gender") && (
                    <div className="text-xs text-destructive">
                        {err("gender")}
                    </div>
                )}
            </div>
        </div>
    );
}

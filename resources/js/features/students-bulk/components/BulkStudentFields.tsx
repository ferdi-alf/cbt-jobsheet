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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field
                label="Username"
                value={item.username}
                onChange={(v) => bulk.update(idx, { username: v })}
                error={err("username")}
            />
            <Field
                label="Email"
                value={item.email}
                onChange={(v) => bulk.update(idx, { email: v })}
                error={err("email")}
            />
            <Field
                label="Password"
                type="password"
                value={item.password}
                onChange={(v) => bulk.update(idx, { password: v })}
                error={err("password")}
            />
            <Field
                label="Nama Lengkap"
                value={item.full_name}
                onChange={(v) => bulk.update(idx, { full_name: v })}
                error={err("full_name")}
            />
            <Field
                label="NISN"
                value={item.nisn}
                onChange={(v) => bulk.update(idx, { nisn: v })}
                error={err("nisn")}
            />

            <div className="space-y-1">
                <Label>Gender</Label>
                <Select
                    value={item.gender}
                    onValueChange={(v: any) => bulk.update(idx, { gender: v })}
                >
                    <SelectTrigger
                        className={cn(err("gender") && "border-destructive")}
                    >
                        <SelectValue placeholder="Pilih gender" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="laki-laki">Laki-laki</SelectItem>
                        <SelectItem value="perempuan">Perempuan</SelectItem>
                    </SelectContent>
                </Select>
                {err("gender") && (
                    <div className="text-xs text-destructive">
                        {err("gender")}
                    </div>
                )}
            </div>

            <Field
                label="Phone"
                value={item.phone}
                onChange={(v) => bulk.update(idx, { phone: v })}
                error={err("phone")}
            />
        </div>
    );
}

function Field({
    label,
    value,
    onChange,
    error,
    type,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    error?: string | null;
    type?: string;
}) {
    return (
        <div className="space-y-1">
            <Label>{label}</Label>
            <Input
                type={type ?? "text"}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={cn(error && "border-destructive")}
            />
            {error && <div className="text-xs text-destructive">{error}</div>}
        </div>
    );
}

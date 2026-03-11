import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import type { PasswordFormState } from "../types";

export default function ProfilePasswordCard({
    form,
    onChange,
    onSubmit,
    loading,
    visibility,
}: {
    form: PasswordFormState;
    onChange: (key: keyof PasswordFormState, value: string) => void;
    onSubmit: () => void;
    loading?: boolean;
    visibility: {
        showCurrent: boolean;
        setShowCurrent: (v: boolean | ((p: boolean) => boolean)) => void;
        showNew: boolean;
        setShowNew: (v: boolean | ((p: boolean) => boolean)) => void;
        showConfirm: boolean;
        setShowConfirm: (v: boolean | ((p: boolean) => boolean)) => void;
    };
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <PasswordInput
                    label="Password Lama"
                    value={form.current_password}
                    visible={visibility.showCurrent}
                    onToggle={() => visibility.setShowCurrent((v) => !v)}
                    onChange={(v) => onChange("current_password", v)}
                />

                <PasswordInput
                    label="Password Baru"
                    value={form.password}
                    visible={visibility.showNew}
                    onToggle={() => visibility.setShowNew((v) => !v)}
                    onChange={(v) => onChange("password", v)}
                />

                <PasswordInput
                    label="Konfirmasi Password Baru"
                    value={form.password_confirmation}
                    visible={visibility.showConfirm}
                    onToggle={() => visibility.setShowConfirm((v) => !v)}
                    onChange={(v) => onChange("password_confirmation", v)}
                />

                <Button onClick={onSubmit} disabled={loading}>
                    Simpan Password
                </Button>
            </CardContent>
        </Card>
    );
}

function PasswordInput({
    label,
    value,
    visible,
    onToggle,
    onChange,
}: {
    label: string;
    value: string;
    visible: boolean;
    onToggle: () => void;
    onChange: (value: string) => void;
}) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            <div className="relative">
                <Input
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="pr-10"
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
        </div>
    );
}

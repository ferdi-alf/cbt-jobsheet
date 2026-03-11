import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import type { DetailFormState } from "../types";

export default function ProfileDetailCard({
    form,
    onChange,
    onSubmit,
    loading,
}: {
    form: DetailFormState;
    onChange: (key: string, value: string) => void;
    onSubmit: () => void;
    loading?: boolean;
}) {
    if (form.type === "admin") return null;

    const readOnlyClass = "opacity-60";

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field
                        label="Nama Lengkap"
                        value={form.full_name}
                        onChange={(v) => onChange("full_name", v)}
                    />

                    <Field
                        label="No HP"
                        value={form.phone}
                        onChange={(v) => onChange("phone", v)}
                    />

                    {form.type === "guru" && (
                        <>
                            <Field
                                label="NIP"
                                value={form.nip}
                                onChange={(v) => onChange("nip", v)}
                            />

                            <Field
                                label="Gender"
                                value={form.gender}
                                onChange={(v) => onChange("gender", v)}
                            />

                            <Field
                                label="Kelas"
                                value={form.kelas_name}
                                readOnly
                                className={readOnlyClass}
                            />

                            <Field
                                label="Mapel"
                                value={form.mapel_name}
                                readOnly
                                className={readOnlyClass}
                            />
                        </>
                    )}

                    {form.type === "siswa" && (
                        <>
                            <Field
                                label="NISN"
                                value={form.nisn}
                                readOnly
                                className={readOnlyClass}
                            />

                            <Field
                                label="Gender"
                                value={form.gender}
                                readOnly
                                className={readOnlyClass}
                            />

                            <Field
                                label="Kelas"
                                value={form.kelas_name}
                                readOnly
                                className={readOnlyClass}
                            />
                        </>
                    )}
                </div>

                <Button onClick={onSubmit} disabled={loading}>
                    Simpan Profil
                </Button>
            </CardContent>
        </Card>
    );
}

function Field({
    label,
    value,
    onChange,
    readOnly = false,
    className,
}: {
    label: string;
    value: string;
    onChange?: (value: string) => void;
    readOnly?: boolean;
    className?: string;
}) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            <Input
                value={value}
                readOnly={readOnly}
                onChange={(e) => onChange?.(e.target.value)}
                className={className}
            />
        </div>
    );
}

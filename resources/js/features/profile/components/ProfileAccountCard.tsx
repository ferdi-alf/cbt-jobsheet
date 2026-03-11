import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import type { AccountFormState } from "../types";

export default function ProfileAccountCard({
    form,
    onChange,
    onSubmit,
    loading,
}: {
    form: AccountFormState;
    onChange: (key: keyof AccountFormState, value: string) => void;
    onSubmit: () => void;
    loading?: boolean;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Akun</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-2">
                    <Label>Username</Label>
                    <Input
                        value={form.name}
                        onChange={(e) => onChange("name", e.target.value)}
                    />
                </div>

                <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => onChange("email", e.target.value)}
                    />
                </div>

                <Button onClick={onSubmit} disabled={loading}>
                    Simpan Akun
                </Button>
            </CardContent>
        </Card>
    );
}

import { Head, Link, useForm } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Checkbox } from "@/Components/ui/checkbox";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import { FormEventHandler, useState } from "react";
import GuestLayout from "@/Layouts/GuestLayout";

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("login"), { onFinish: () => reset("password") });
    };

    return (
        <>
            <Head title="Login" />
            <GuestLayout>
                <Card
                    className="w-full shadow-lg border-0"
                    style={{ background: "#ffffff" }}
                >
                    <CardHeader className="text-center">
                        <div
                            className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full shadow-sm"
                            style={{
                                background:
                                    "linear-gradient(135deg, #addfff 0%, #97d6ff 50%, #3291ff 100%)",
                            }}
                        >
                            <GraduationCap className="h-7 w-7 text-white" />
                        </div>
                        <CardTitle
                            className="text-2xl"
                            style={{ color: "#0f3460" }}
                        >
                            CBT Jobsheet
                        </CardTitle>
                        <CardDescription>
                            Masuk menggunakan akun admin, guru, atau siswa
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {status && (
                            <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    autoComplete="username"
                                    autoFocus
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        value={data.password}
                                        autoComplete="current-password"
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-destructive">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm">
                                    <Checkbox
                                        checked={data.remember}
                                        onCheckedChange={(c) =>
                                            setData("remember", Boolean(c))
                                        }
                                    />
                                    Remember me
                                </label>

                                {canResetPassword && (
                                    <Link
                                        href="/siswa/reset-password"
                                        className="text-sm underline hover:text-foreground"
                                        style={{ color: "#3291ff" }}
                                    >
                                        Lupa password?
                                    </Link>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full text-white font-semibold"
                                disabled={processing}
                                style={{
                                    background:
                                        "linear-gradient(135deg, #2e8de0 0%, #3291ff 100%)",
                                    border: "none",
                                }}
                            >
                                {processing ? "Memproses..." : "Login"}
                            </Button>

                            <p className="text-center text-xs text-muted-foreground">
                                © {new Date().getFullYear()} CBT Jobsheet
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </GuestLayout>
        </>
    );
}

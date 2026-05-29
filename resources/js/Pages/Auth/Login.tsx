import { Button } from "@/Components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Checkbox } from "@/Components/ui/checkbox";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Head, Link, useForm } from "@inertiajs/react";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import { FormEventHandler, useState } from "react";

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
        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <>
            <Head title="Login" />

            <div className="min-h-screen flex flex-col">
                <nav
                    className="flex items-center gap-4 px-6 shadow-md"
                    style={{
                        background:
                            "linear-gradient(135deg, #1a3a6b 0%, #1565C0 60%, #0d47a1 100%)",
                        height: "62px",
                    }}
                >
                    <img
                        src="/storage/logo/logo-1.png"
                        alt="Logo 1"
                        className="sm:h-10 h-8 w-auto object-contain"
                    />
                    <div
                        className="h-8 w-px"
                        style={{ background: "rgba(255,255,255,0.3)" }}
                    />
                    <img
                        src="/storage/logo/logo-2.png"
                        alt="Logo 2"
                        className="sm:h-10 h-8 w-auto object-contain"
                    />
                </nav>

                <div className="flex md:flex-row h-screen flex-col-reverse">
                    <div
                        className="flex h-full flex-1 lg:w-[60%] flex-col items-center justify-center relative overflow-hidden"
                        style={{
                            background:
                                "linear-gradient(135deg, #1a3a6b 0%, #1976D2 50%, #42a5f5 100%)",
                        }}
                    >
                        <div
                            className="absolute -top-20 -right-20 rounded-full pointer-events-none"
                            style={{
                                width: 320,
                                height: 320,
                                background: "rgba(255,255,255,0.05)",
                            }}
                        />
                        <div
                            className="absolute -bottom-16 -left-16 rounded-full pointer-events-none"
                            style={{
                                width: 260,
                                height: 260,
                                background: "rgba(255,255,255,0.05)",
                            }}
                        />

                        <img
                            src="/storage/logo/logo-login.png"
                            alt="Login Banner"
                            className="relative z-10 w-full  object-contain drop-shadow-2xl"
                            style={{ maxHeight: "65vh" }}
                        />
                    </div>

                    <div className="flex flex-1 lg:flex-none lg:w-[40%] items-center justify-center p-6 h-full">
                        <div className="w-full max-w-md lg:w-96">
                            <Card className="w-full shadow-md">
                                <CardHeader className="text-center">
                                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border bg-background shadow-sm">
                                        <GraduationCap className="h-7 w-7" />
                                    </div>
                                    <CardTitle className="text-2xl">
                                        CBT Jobsheet
                                    </CardTitle>
                                    <CardDescription>
                                        Masuk menggunakan akun admin, guru, atau
                                        siswa
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    {status && (
                                        <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                                            {status}
                                        </div>
                                    )}

                                    <form
                                        onSubmit={submit}
                                        className="space-y-4"
                                    >
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                autoComplete="username"
                                                autoFocus
                                                onChange={(e) =>
                                                    setData(
                                                        "email",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            {errors.email && (
                                                <p className="text-sm text-destructive">
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password">
                                                Password
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    value={data.password}
                                                    autoComplete="current-password"
                                                    onChange={(e) =>
                                                        setData(
                                                            "password",
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            !showPassword,
                                                        )
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
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        setData(
                                                            "remember",
                                                            Boolean(checked),
                                                        )
                                                    }
                                                />
                                                Remember me
                                            </label>

                                            {canResetPassword && (
                                                <Link
                                                    href={route(
                                                        "password.request",
                                                    )}
                                                    className="text-sm underline text-muted-foreground hover:text-foreground"
                                                >
                                                    Lupa password?
                                                </Link>
                                            )}
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={processing}
                                        >
                                            {processing
                                                ? "Memproses..."
                                                : "Login"}
                                        </Button>

                                        <p className="text-center text-xs text-muted-foreground">
                                            © {new Date().getFullYear()} CBT
                                            Jobsheet
                                        </p>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

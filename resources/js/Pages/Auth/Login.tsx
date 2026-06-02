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
import {
    GraduationCap,
    Eye,
    EyeOff,
    BookOpen,
    UserPlus,
    Menu,
    X,
} from "lucide-react";
import { FormEventHandler, useState } from "react";

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

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

    // Style tombol navbar — SAMA untuk keduanya
    const navBtnStyle: React.CSSProperties = {
        color: "#ffffff",
        background: "rgba(255,255,255,0.15)",
        border: "1px solid rgba(255,255,255,0.35)",
    };

    return (
        <>
            <Head title="Login" />

            <div className="h-screen flex flex-col">
                <nav
                    className="flex items-center px-6 p-3 shadow-md z-50 relative"
                    style={{
                        background:
                            "linear-gradient(135deg, #1a6abf 0%, #2e8de0 50%, #3291ff 100%)",
                        height: "62px",
                    }}
                >
                    {/* Kiri: Logo */}
                    <div className="flex items-center gap-4 flex-1">
                        <img
                            src="/storage/logo/logo-1.png"
                            alt="Logo 1"
                            className="sm:h-10 h-8 w-auto object-contain"
                        />
                        <div
                            className="h-8 w-px"
                            style={{ background: "rgba(255,255,255,0.35)" }}
                        />
                        <img
                            src="/storage/logo/logo-2.png"
                            alt="Logo 2"
                            className="sm:h-10 h-8 w-auto object-contain"
                        />
                    </div>

                    {/* Kanan Desktop: 2 tombol (md ke atas) */}
                    <div className="hidden md:flex items-center gap-2">
                        <a
                            href="/"
                            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md transition-colors whitespace-nowrap"
                            style={navBtnStyle}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.background =
                                    "rgba(255,255,255,0.28)")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                    "rgba(255,255,255,0.15)")
                            }
                        >
                            <BookOpen className="h-4 w-4" />
                            Panduan Aplikasi
                        </a>

                        <a
                            href="/"
                            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md transition-colors whitespace-nowrap"
                            style={navBtnStyle}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.background =
                                    "rgba(255,255,255,0.28)")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                    "rgba(255,255,255,0.15)")
                            }
                        >
                            <UserPlus className="h-4 w-4" />
                            Register Akun Siswa
                        </a>
                    </div>

                    {/* Hamburger button (mobile) */}
                    <button
                        className="md:hidden flex items-center justify-center w-9 h-9 rounded-md transition-colors"
                        style={{
                            color: "#ffffff",
                            background: "rgba(255,255,255,0.15)",
                            border: "1px solid rgba(255,255,255,0.3)",
                        }}
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </button>
                </nav>

                {menuOpen && (
                    <div
                        className="md:hidden flex flex-col gap-2 px-4 py-3 z-40 shadow-md"
                        style={{
                            background:
                                "linear-gradient(180deg, #2e8de0 0%, #3291ff 100%)",
                        }}
                    >
                        <a
                            href="/"
                            className="flex items-center gap-3 text-sm font-medium px-4 py-2.5 rounded-md transition-colors"
                            style={navBtnStyle}
                            onClick={() => setMenuOpen(false)}
                        >
                            <BookOpen className="h-4 w-4 shrink-0" />
                            Panduan Aplikasi
                        </a>

                        <a
                            href="/"
                            className="flex items-center gap-3 text-sm font-medium px-4 py-2.5 rounded-md transition-colors"
                            style={navBtnStyle}
                            onClick={() => setMenuOpen(false)}
                        >
                            <UserPlus className="h-4 w-4 shrink-0" />
                            Register Akun Siswa
                        </a>
                    </div>
                )}

                <div className="flex md:flex-row flex-col-reverse flex-1 h-screen">
                    <div
                        className="md:flex hidden h-full flex-1 lg:w-[60%] flex-col items-center justify-center relative overflow-hidden"
                        style={{
                            background:
                                "linear-gradient(145deg, #5bb8f5 0%, #7dcbf8 25%, #97d6ff 55%, #addfff 80%, #c8ecff 100%)",
                        }}
                    >
                        <div
                            className="absolute -top-20 -right-20 rounded-full pointer-events-none"
                            style={{
                                width: 320,
                                height: 320,
                                background: "rgba(255,255,255,0.2)",
                            }}
                        />
                        <div
                            className="absolute -bottom-16 -left-16 rounded-full pointer-events-none"
                            style={{
                                width: 260,
                                height: 260,
                                background: "rgba(255,255,255,0.15)",
                            }}
                        />
                        <div
                            className="absolute top-1/3 left-1/4 rounded-full pointer-events-none"
                            style={{
                                width: 180,
                                height: 180,
                                background: "rgba(50,145,255,0.08)",
                            }}
                        />
                        <img
                            src="/storage/logo/logo-login.png"
                            alt="Login Banner"
                            className="relative z-10 w-full object-contain drop-shadow-xl"
                            style={{ maxHeight: "65vh" }}
                        />
                    </div>

                    <div
                        className="flex flex-1 lg:flex-none lg:w-[40%] items-center justify-center p-6 h-full"
                        style={{ background: "#f0f7ff" }}
                    >
                        <div className="w-full max-w-md lg:w-96">
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
                                            border: "none",
                                        }}
                                    >
                                        <GraduationCap
                                            className="h-7 w-7"
                                            style={{ color: "#ffffff" }}
                                        />
                                    </div>
                                    <CardTitle
                                        className="text-2xl"
                                        style={{ color: "#0f3460" }}
                                    >
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
                                                    className="text-sm underline hover:text-foreground transition-colors"
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

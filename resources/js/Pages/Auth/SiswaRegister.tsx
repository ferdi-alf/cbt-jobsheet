import { Head, useForm, Link } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    LogIn,
    Eye,
    EyeOff,
    ArrowLeft,
    CheckCircle2,
    Loader2,
} from "lucide-react";
import { useState } from "react";
import GuestLayout from "@/Layouts/GuestLayout";
import { toast } from "sonner";

function getCsrf(): string {
    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content") ?? ""
    );
}

async function verifyIdentityApi(nisn: string, full_name: string) {
    const res = await fetch("/api/siswa/verify-identity", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": getCsrf(),
        },
        body: JSON.stringify({ nisn, full_name }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Data tidak ditemukan.");
    }
    return json.data as {
        nisn: string;
        full_name: string;
        already_registered: boolean;
    };
}

export default function SiswaRegister() {
    const [step, setStep] = useState<1 | 2>(1);
    const [verifying, setVerifying] = useState(false);

    const [nisn, setNisn] = useState("");
    const [fullName, setFullName] = useState("");

    const [showPw, setShowPw] = useState(false);
    const [showPwConf, setShowPwConf] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        nisn: "",
        full_name: "",
        username: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nisn.trim() || !fullName.trim()) {
            toast.error("NISN dan nama lengkap wajib diisi.");
            return;
        }
        setVerifying(true);
        toast.dismiss();
        try {
            const result = await verifyIdentityApi(
                nisn.trim(),
                fullName.trim(),
            );
            if (result.already_registered) {
                toast.error(
                    "Akun ini sudah terdaftar. Silakan login atau gunakan fitur lupa password.",
                );
                return;
            }
            setData((prev) => ({
                ...prev,
                nisn: nisn.trim(),
                full_name: fullName.trim(),
            }));
            setStep(2);
        } catch (e: any) {
            toast.error(e?.message ?? "Terjadi kesalahan, coba lagi.");
        } finally {
            setVerifying(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("siswa.register.store"));
    };

    const backToLogin = (
        <Link
            href={route("login")}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md transition-colors whitespace-nowrap"
            style={{
                color: "#ffffff",
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.35)",
            }}
            onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.28)")
            }
            onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
            }
        >
            <LogIn className="h-4 w-4" />
            Kembali ke Login
        </Link>
    );

    return (
        <>
            <Head title="Register Akun Siswa" />
            <GuestLayout navAction={backToLogin}>
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
                            {step === 1 ? (
                                <CheckCircle2 className="h-7 w-7 text-white" />
                            ) : (
                                <CheckCircle2 className="h-7 w-7 text-white" />
                            )}
                        </div>
                        <CardTitle
                            className="text-xl"
                            style={{ color: "#0f3460" }}
                        >
                            {step === 1
                                ? "Verifikasi Identitas"
                                : "Lengkapi Akun"}
                        </CardTitle>
                        <CardDescription>
                            {step === 1
                                ? "Masukkan NISN dan nama lengkap sesuai data yang terdaftar."
                                : `Halo, ${fullName}! Isi data akun kamu.`}
                        </CardDescription>

                        <div className="flex items-center justify-center gap-2 mt-2">
                            {[1, 2].map((s) => (
                                <div
                                    key={s}
                                    className="h-2 rounded-full transition-all"
                                    style={{
                                        width: step === s ? 24 : 8,
                                        background:
                                            step >= s ? "#3291ff" : "#d1d5db",
                                    }}
                                />
                            ))}
                        </div>
                    </CardHeader>

                    <CardContent>
                        {step === 1 && (
                            <form onSubmit={handleVerify} className="space-y-4">
                                <div className="space-y-1">
                                    <Label htmlFor="nisn">
                                        NISN{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="nisn"
                                        value={nisn}
                                        onChange={(e) =>
                                            setNisn(e.target.value)
                                        }
                                        placeholder="Nomor Induk Siswa Nasional"
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="full_name">
                                        Nama Lengkap{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="full_name"
                                        value={fullName}
                                        onChange={(e) =>
                                            setFullName(e.target.value)
                                        }
                                        placeholder="Sesuai data yang didaftarkan oleh sekolah"
                                    />
                                    <p className="text-[11px] text-muted-foreground">
                                        Tidak perlu huruf kapital persis —
                                        pengecekan otomatis.
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full text-white font-semibold"
                                    disabled={verifying}
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #2e8de0 0%, #3291ff 100%)",
                                        border: "none",
                                    }}
                                >
                                    {verifying ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Memeriksa...
                                        </>
                                    ) : (
                                        "Verifikasi Identitas"
                                    )}
                                </Button>

                                <p className="text-center text-sm text-muted-foreground">
                                    Sudah punya akun?{" "}
                                    <Link
                                        href={route("login")}
                                        className="underline"
                                        style={{ color: "#3291ff" }}
                                    >
                                        Login di sini
                                    </Link>
                                </p>
                            </form>
                        )}

                        {/* ── Step 2 ── */}
                        {step === 2 && (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
                                    <span className="text-muted-foreground">
                                        NISN:{" "}
                                    </span>
                                    <span className="font-medium">{nisn}</span>
                                    <span className="mx-2 text-muted-foreground">
                                        ·
                                    </span>
                                    <span className="font-medium">
                                        {fullName}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <Label>
                                        Username{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        value={data.username}
                                        onChange={(e) =>
                                            setData("username", e.target.value)
                                        }
                                        placeholder="Nama pengguna untuk login"
                                        autoFocus
                                    />
                                    {errors.username && (
                                        <p className="text-xs text-destructive">
                                            {errors.username}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label>
                                        Email{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        placeholder="email@contoh.com"
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-destructive">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    <div className="space-y-1">
                                        <Label>
                                            Password{" "}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                type={
                                                    showPw ? "text" : "password"
                                                }
                                                value={data.password}
                                                onChange={(e) =>
                                                    setData(
                                                        "password",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Min. 6 karakter"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPw(!showPw)
                                                }
                                                className="absolute right-1 mr-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPw ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="text-xs text-destructive">
                                                {errors.password}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <Label>
                                            Konfirmasi{" "}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                type={
                                                    showPwConf
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={
                                                    data.password_confirmation
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        "password_confirmation",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Ulangi password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPwConf(!showPwConf)
                                                }
                                                className="absolute right-1 mr-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPwConf ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.password_confirmation && (
                                            <p className="text-xs text-destructive">
                                                {errors.password_confirmation}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {errors.nisn && (
                                    <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                                        {errors.nisn}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setStep(1);
                                        }}
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-1" />
                                        Kembali
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 text-white font-semibold"
                                        disabled={processing}
                                        style={{
                                            background:
                                                "linear-gradient(135deg, #2e8de0 0%, #3291ff 100%)",
                                            border: "none",
                                        }}
                                    >
                                        {processing
                                            ? "Menyimpan..."
                                            : "Buat Akun"}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </GuestLayout>
        </>
    );
}

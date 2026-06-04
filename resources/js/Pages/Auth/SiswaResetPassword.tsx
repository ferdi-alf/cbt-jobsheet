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
    KeyRound,
    Eye,
    EyeOff,
    ArrowLeft,
    Loader2,
    LogIn,
    UserPlus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import GuestLayout from "@/Layouts/GuestLayout";

function getCsrf() {
    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content") ?? ""
    );
}

async function verifyForResetApi(
    nisn: string,
    full_name: string,
    email: string,
) {
    const res = await fetch("/api/siswa/verify-for-reset", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": getCsrf(),
        },
        body: JSON.stringify({ nisn, full_name, email }),
    });
    const json = await res.json();
    if (!res.ok || !json.success)
        throw new Error(json.error ?? "Data tidak ditemukan.");
    return json.data;
}

export default function SiswaResetPassword() {
    const [step, setStep] = useState<1 | 2>(1);
    const [verifying, setVerifying] = useState(false);
    const [nisn, setNisn] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");

    const [showPw, setShowPw] = useState(false);
    const [showPwConf, setShowPwConf] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        nisn: "",
        full_name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nisn.trim() || !fullName.trim() || !email.trim()) {
            toast.error("Semua field wajib diisi.");
            return;
        }
        setVerifying(true);
        try {
            await verifyForResetApi(nisn.trim(), fullName.trim(), email.trim());
            setData((prev) => ({
                ...prev,
                nisn: nisn.trim(),
                full_name: fullName.trim(),
                email: email.trim(),
            }));
            toast.success("Identitas terverifikasi!");
            setStep(2);
        } catch (e: any) {
            toast.error(e?.message ?? "Terjadi kesalahan, coba lagi.");
        } finally {
            setVerifying(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("siswa.reset-password.store"), {
            onSuccess: () => toast.success("Password berhasil diubah!"),
        });
    };

    const backToLoginNav = (
        <div className="flex items-center gap-2">
            <Link
                href={route("login")}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md whitespace-nowrap"
                style={{
                    color: "#fff",
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.35)",
                }}
                onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                        "rgba(255,255,255,0.28)")
                }
                onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                        "rgba(255,255,255,0.15)")
                }
            >
                <LogIn className="h-4 w-4" /> Login
            </Link>
            <Link
                href={route("siswa.register")}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md whitespace-nowrap"
                style={{
                    color: "#fff",
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.35)",
                }}
                onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                        "rgba(255,255,255,0.28)")
                }
                onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                        "rgba(255,255,255,0.15)")
                }
            >
                <UserPlus className="h-4 w-4" /> Register
            </Link>
        </div>
    );

    return (
        <>
            <Head title="Reset Password Siswa" />
            <GuestLayout navAction={backToLoginNav}>
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
                            <KeyRound className="h-7 w-7 text-white" />
                        </div>
                        <CardTitle
                            className="text-xl"
                            style={{ color: "#0f3460" }}
                        >
                            {step === 1
                                ? "Reset Password"
                                : "Buat Password Baru"}
                        </CardTitle>
                        <CardDescription>
                            {step === 1
                                ? "Verifikasi identitas kamu terlebih dahulu."
                                : "Masukkan password baru untuk akunmu."}
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
                                    <Label>
                                        NISN{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        value={nisn}
                                        onChange={(e) =>
                                            setNisn(e.target.value)
                                        }
                                        placeholder="Nomor Induk Siswa Nasional"
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>
                                        Nama Lengkap{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        value={fullName}
                                        onChange={(e) =>
                                            setFullName(e.target.value)
                                        }
                                        placeholder="Sesuai data yang terdaftar"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>
                                        Email Terdaftar{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="Email yang digunakan untuk akun ini"
                                    />
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
                                    Ingat password?{" "}
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
                                        Password Baru{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type={showPw ? "text" : "password"}
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    "password",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Min. 6 karakter"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPw(!showPw)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                                        Konfirmasi Password{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type={
                                                showPwConf ? "text" : "password"
                                            }
                                            value={data.password_confirmation}
                                            onChange={(e) =>
                                                setData(
                                                    "password_confirmation",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Ulangi password baru"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPwConf(!showPwConf)
                                            }
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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

                                {errors.nisn && (
                                    <p className="text-xs text-destructive">
                                        {errors.nisn}
                                    </p>
                                )}

                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setStep(1)}
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-1" />{" "}
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
                                            : "Simpan Password Baru"}
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

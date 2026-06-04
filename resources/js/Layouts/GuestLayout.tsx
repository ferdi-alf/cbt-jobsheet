import { ReactNode, useState } from "react";
import { Link } from "@inertiajs/react";
import { BookOpen, UserPlus, LogIn, Menu, X, KeyRound } from "lucide-react";

type GuestLayoutProps = {
    children: ReactNode;
    /** Ganti tombol kanan navbar. Default: Register Akun Siswa */
    navAction?: ReactNode;
};

const NAV_BTN_STYLE: React.CSSProperties = {
    color: "#ffffff",
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.35)",
};

function NavButton({
    href,
    children,
    onClick,
}: {
    href?: string;
    children: ReactNode;
    onClick?: () => void;
}) {
    const cls =
        "flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md transition-colors whitespace-nowrap";

    const handleEnter = (e: React.MouseEvent<HTMLAnchorElement>) =>
        (e.currentTarget.style.background = "rgba(255,255,255,0.28)");
    const handleLeave = (e: React.MouseEvent<HTMLAnchorElement>) =>
        (e.currentTarget.style.background = "rgba(255,255,255,0.15)");

    return (
        <a
            href={href ?? "#"}
            className={cls}
            style={NAV_BTN_STYLE}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            onClick={onClick}
        >
            {children}
        </a>
    );
}

export default function GuestLayout({ children, navAction }: GuestLayoutProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const defaultNavAction = (
        <div className="flex items-center gap-2">
            <Link
                href={route("siswa.register")}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md transition-colors whitespace-nowrap"
                style={NAV_BTN_STYLE}
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
                Register Siswa
            </Link>
            <Link
                href={route("siswa.reset-password")}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md transition-colors whitespace-nowrap"
                style={NAV_BTN_STYLE}
                onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                        "rgba(255,255,255,0.28)")
                }
                onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                        "rgba(255,255,255,0.15)")
                }
            >
                <KeyRound className="h-4 w-4" />
                Reset Password
            </Link>
        </div>
    );

    const action = navAction ?? defaultNavAction;

    const mobileAction = navAction ?? (
        <>
            <a
                href={route("siswa.register")}
                className="flex items-center gap-3 text-sm font-medium px-4 py-2.5 rounded-md"
                style={NAV_BTN_STYLE}
                onClick={() => setMenuOpen(false)}
            >
                <UserPlus className="h-4 w-4 shrink-0" /> Register Siswa
            </a>

            <a
                href={route("siswa.reset-password")}
                className="flex items-center gap-3 text-sm font-medium px-4 py-2.5 rounded-md"
                style={NAV_BTN_STYLE}
                onClick={() => setMenuOpen(false)}
            >
                <KeyRound className="h-4 w-4 shrink-0" /> Reset Password
            </a>
        </>
    );

    return (
        <div className="h-screen flex flex-col">
            <nav
                className="flex items-center px-6 p-3 shadow-md z-50 relative"
                style={{
                    background:
                        "linear-gradient(135deg, #1a6abf 0%, #2e8de0 50%, #3291ff 100%)",
                    height: "62px",
                }}
            >
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

                <div className="hidden md:flex items-center gap-2">
                    <NavButton href="/">
                        <BookOpen className="h-4 w-4" />
                        Panduan Aplikasi
                    </NavButton>
                    {action}
                </div>

                {/* Mobile hamburger */}
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
                        className="flex items-center gap-3 text-sm font-medium px-4 py-2.5 rounded-md"
                        style={NAV_BTN_STYLE}
                        onClick={() => setMenuOpen(false)}
                    >
                        <BookOpen className="h-4 w-4 shrink-0" />
                        Panduan Aplikasi
                    </a>
                    {mobileAction}
                </div>
            )}

            <div className="flex md:flex-row flex-col-reverse flex-1 overflow-hidden">
                {/* Left panel */}
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
                        alt="Banner"
                        className="relative z-10 w-full object-contain drop-shadow-xl"
                        style={{ maxHeight: "65vh" }}
                    />
                </div>

                <div
                    className="flex flex-1 lg:flex-none lg:w-[40%] items-center justify-center p-6 h-full overflow-y-auto"
                    style={{ background: "#f0f7ff" }}
                >
                    <div className="w-full max-w-md lg:w-96">{children}</div>
                </div>
            </div>
        </div>
    );
}

export default function DesktopTopbar() {
    return (
        <div
            className="hidden md:flex items-center gap-4 px-6 shrink-0"
            style={{
                background:
                    "linear-gradient(135deg, #004A80 0%, #0072AD 50%, #0090D0 100%)",
                height: "62px",
            }}
        >
            <img
                src="/storage/logo/logo-1.png"
                alt="Logo 1"
                className="h-10 w-auto object-contain"
            />
            <div
                className="h-8 w-px"
                style={{ background: "rgba(255,255,255,0.3)" }}
            />
            <img
                src="/storage/logo/logo-2.png"
                alt="Logo 2"
                className="h-10 w-auto object-contain"
            />
        </div>
    );
}

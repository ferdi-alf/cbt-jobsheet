function buildBulkToastFromErrors(
    prefix: string,
    errors: Record<string, string[]>,
) {
    const keys = Object.keys(errors).filter((k) => k.startsWith(prefix + "."));
    if (!keys.length) return null;

    keys.sort();
    const firstKey = keys[0];
    const parts = firstKey.split(".");
    const idx = Number(parts[1]);
    const field = parts[2];

    const labelMap: Record<string, string> = {
        username: "Username",
        email: "Email",
        password: "Password",
        full_name: "Nama lengkap",
        nisn: "NISN",
        gender: "Gender",
        phone: "No. HP",
    };

    const fieldLabel = labelMap[field] ?? field;
    const studentNo = Number.isFinite(idx) ? idx + 1 : null;
    const title = studentNo ? `${fieldLabel} siswa ${studentNo}` : fieldLabel;

    const description = errors[firstKey]?.[0] ?? "Data tidak valid.";
    return { title, description };
}

export async function downloadFile(url: string, filenameFallback = "download") {
    const res = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
            Accept: "application/octet-stream",
        },
    });

    if (!res.ok) {
        let message = "Gagal download file";
        try {
            const json = await res.json();
            message = json?.error || json?.message || message;
        } catch {}
        throw new Error(message);
    }

    const blob = await res.blob();

    const disposition = res.headers.get("Content-Disposition");
    let filename = filenameFallback;

    if (disposition) {
        const match = disposition.match(
            /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
        );
        if (match?.[1]) {
            filename = match[1].replace(/['"]/g, "");
        }
    }

    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(blobUrl);
}

export function downloadFile(fileUrl: string | undefined): void {
    if (!fileUrl) {
        return;
    }
    const url = new URL(fileUrl);
    url.searchParams.append("target", "window");

    window.open(url, "mendix_file");
}

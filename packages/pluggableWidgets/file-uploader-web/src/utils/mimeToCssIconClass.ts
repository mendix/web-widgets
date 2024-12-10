export function mimeToCssIconClass(mime: string): string {
    if (mime.startsWith("image/")) {
        return "img-file-icon";
    }

    // if (mime.startsWith("text/")) {
    //     return "text-file-icon";
    // }
    //
    // if (mime.startsWith("application/")) {
    //     return "application-file-icon";
    // }

    return "doc-file-icon";
}

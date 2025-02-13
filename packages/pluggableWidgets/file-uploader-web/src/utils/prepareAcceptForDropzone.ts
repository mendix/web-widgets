import { FileCheckFormat } from "./predefinedFormats";
import { MimeCheckFormat } from "./parseAllowedFormats";

export function prepareAcceptForDropzone(formats: FileCheckFormat[]): MimeCheckFormat {
    const acc = {} as MimeCheckFormat;
    acc["dummy/mime"] = [];

    for (const f of formats) {
        for (const [mime, exts] of f.entries) {
            if (!acc[mime]) {
                acc[mime] = [];
            }
            acc[mime].push(...exts);
        }
    }

    if (acc["dummy/mime"].length === 0) {
        delete acc["dummy/mime"];
    }

    return acc;
}

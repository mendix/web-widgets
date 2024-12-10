import { FileCheckFormat } from "./predefinedFormats";
import { MimeCheckFormat } from "./parseAllowedFormats";

export function prepareAcceptForDropzone(formats: FileCheckFormat[]): MimeCheckFormat {
    const acc = {} as MimeCheckFormat;
    acc["dummy/mime"] = [];

    for (const f of formats) {
        for (const [mime, exts] of f.entries) {
            if (exts.length) {
                // add extensions only
                acc["dummy/mime"].push(...exts);
            } else {
                // add mime type only
                acc[mime] = [];
            }
        }
    }

    if (acc["dummy/mime"].length === 0) {
        delete acc["dummy/mime"];
    }

    return acc;
}

import { PredefinedTypeEnum } from "../../typings/FileUploaderProps";

export type FileCheckFormat = {
    entries: Array<[mime: string, exts: string[]]>;
    description: string;
};

export const predefinedFormats: Record<PredefinedTypeEnum, FileCheckFormat> = {
    pdfFile: {
        entries: [["application/pdf", []]],
        description: "PDF Document (.pdf)"
    },
    msWordFile: {
        entries: [
            ["application/msword", []],
            ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", []]
        ],
        description: "Microsoft Word (.doc and .docx)"
    },
    msExcelFile: {
        entries: [
            ["application/vnd.ms-excel", []],
            ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", []]
        ],
        description: "Microsoft Excel (.xls and .xlsx)"
    },
    msPowerPointFile: {
        entries: [
            ["application/vnd.ms-powerpoint", []],
            ["application/vnd.openxmlformats-officedocument.presentationml.presentation", []]
        ],
        description: "Microsoft PowerPoint (.ppt and .pptx)"
    },
    plainTextFile: {
        entries: [["text/plain", [".txt"]]],
        description: "Plain Text (.txt)"
    },
    csvFile: {
        entries: [["text/csv", []]],
        description: "CSV (.csv)"
    },
    zipArchiveFile: {
        entries: [
            ["application/x-zip-compressed", []],
            ["application/zip", []]
        ],
        description: "Zip archive"
    },
    anyTextFile: {
        entries: [["text/*", []]],
        description: "Text file"
    },
    anyImageFile: {
        entries: [
            ["image/png", [".png"]],
            ["image/jpeg", [".jpeg", ".jpg"]],
            ["image/gif", [".gif"]],
            ["image/bmp", [".bmp"]],
            ["image/webp", [".webp"]],
            ["image/svg+xml", [".svg"]]
        ],
        description: "Image"
    },
    anyAudioFile: {
        entries: [["audio/*", []]],
        description: "Audio"
    },
    anyVideoFile: {
        entries: [["video/*", []]],
        description: "Video"
    }
};

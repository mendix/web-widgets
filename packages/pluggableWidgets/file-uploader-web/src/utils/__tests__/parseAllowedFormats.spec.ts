import { AllowedFileFormatsType } from "../../../typings/FileUploaderProps";
import { parseAllowedFormats } from "../parseAllowedFormats";
import { dynamicValue } from "@mendix/widget-plugin-test-utils";

describe("parseAllowedFormats", () => {
    test("returns parsed results for correct advanced formats", () => {
        const input: AllowedFileFormatsType[] = [
            {
                configMode: "advanced",
                typeFormatDescription: dynamicValue("test"),
                predefinedType: "pdfFile",
                mimeType: "image/jpeg",
                extensions: ".jpg,.jpeg"
            },
            {
                configMode: "advanced",
                typeFormatDescription: dynamicValue("test2"),
                predefinedType: "pdfFile",
                mimeType: "application/pdf",
                extensions: ".pdf"
            },
            {
                configMode: "advanced",
                typeFormatDescription: dynamicValue("test"),
                predefinedType: "pdfFile",
                mimeType: "text/*",
                extensions: ""
            },
            {
                configMode: "advanced",
                typeFormatDescription: dynamicValue("test2"),
                predefinedType: "pdfFile",
                mimeType: "",
                extensions: ".html,.txt"
            }
        ];

        expect(parseAllowedFormats(input)).toEqual([
            {
                description: "test",
                entries: [
                    ["image/jpeg", [".jpg", ".jpeg"]],
                    ["text/*", []]
                ]
            },
            {
                description: "test2",
                entries: [
                    ["application/pdf", [".pdf"]],
                    ["dummy/mime", [".html", ".txt"]]
                ]
            }
        ]);
    });
    test("joins extensions of duplicated mime types", () => {
        const input: AllowedFileFormatsType[] = [
            {
                configMode: "advanced",
                typeFormatDescription: dynamicValue("test"),
                predefinedType: "pdfFile",
                mimeType: "image/*",
                extensions: ".jpg"
            },
            {
                configMode: "advanced",
                typeFormatDescription: dynamicValue("test"),
                predefinedType: "pdfFile",
                mimeType: "image/*",
                extensions: ".png"
            }
        ];

        expect(parseAllowedFormats(input)).toEqual([
            {
                description: "test",
                entries: [
                    ["image/*", [".jpg"]],
                    ["image/*", [".png"]]
                ]
            }
        ]);
    });
    test("throws on incorrect mime format", () => {
        const input: AllowedFileFormatsType[] = [
            {
                configMode: "advanced",
                typeFormatDescription: dynamicValue("test"),
                predefinedType: "pdfFile",
                mimeType: "application-pdf",
                extensions: ".pdf"
            }
        ];

        expect(() => parseAllowedFormats(input)).toThrow(
            "Value 'application-pdf' is not recognized. Accepted format: 'image/jpeg'"
        );
    });
    test("handles extensions with special characters like dashes and plus signs", () => {
        const input: AllowedFileFormatsType[] = [
            {
                configMode: "advanced",
                typeFormatDescription: dynamicValue("special-extensions"),
                predefinedType: "pdfFile",
                mimeType: "application/x-custom",
                extensions: ".tar-gz,.js-map,.c++"
            }
        ];

        expect(parseAllowedFormats(input)).toEqual([
            {
                description: "special-extensions",
                entries: [["application/x-custom", [".tar-gz", ".js-map", ".c++"]]]
            }
        ]);
    });
    test("throws on extension without leading dot", () => {
        const input: AllowedFileFormatsType[] = [
            {
                configMode: "advanced",
                typeFormatDescription: dynamicValue("test"),
                predefinedType: "pdfFile",
                mimeType: "text/*",
                extensions: ".txt,pdf"
            }
        ];

        expect(() => parseAllowedFormats(input)).toThrow(
            "Value 'pdf' is not recognized. Extension must start with a dot and contain only valid filename characters"
        );
    });

    test("throws on incorrect extension format", () => {
        const input: AllowedFileFormatsType[] = [
            {
                configMode: "advanced",
                typeFormatDescription: dynamicValue("test"),
                predefinedType: "pdfFile",
                mimeType: "text/*",
                extensions: ".txt,.cvs,abc"
            }
        ];

        expect(() => parseAllowedFormats(input)).toThrow(
            "Value 'abc' is not recognized. Extension must start with a dot and contain only valid filename characters"
        );
    });

    test("throws on extension with dot in the middle", () => {
        const input: AllowedFileFormatsType[] = [
            {
                configMode: "advanced",
                typeFormatDescription: dynamicValue("test"),
                predefinedType: "pdfFile",
                mimeType: "text/*",
                extensions: ".txt,.config.json"
            }
        ];

        expect(() => parseAllowedFormats(input)).toThrow(
            "Value '.config.json' is not recognized. Extension must start with a dot and contain only valid filename characters"
        );
    });
});

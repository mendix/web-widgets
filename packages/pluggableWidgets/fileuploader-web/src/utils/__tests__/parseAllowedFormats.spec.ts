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
                typeFormatDescription: dynamicValue("test"),
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
                typeFormatDescription: dynamicValue("test"),
                predefinedType: "pdfFile",
                mimeType: "",
                extensions: ".html,.txt"
            }
        ];

        expect(parseAllowedFormats(input)).toEqual({
            "image/jpeg": [".jpg", ".jpeg"],
            "application/pdf": [".pdf"],
            "dummy/mime": [".html", ".txt"],
            "text/*": []
        });
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

        expect(parseAllowedFormats(input)).toEqual({
            "image/*": [".jpg", ".png"]
        });
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

        expect(() => parseAllowedFormats(input)).toThrow("Value 'abc' is not recognized. Accepted format: '.pdf'");
    });
});

import { AllowedFileFormatsType } from "../../../typings/FileUploaderProps";
import { parseAllowedFormats } from "../parseAllowedFormats";

describe("parseAllowedFormats", () => {
    test("returns parsed results for correct formats", () => {
        const input: AllowedFileFormatsType[] = [
            {
                mimeType: "image/jpeg",
                extensions: ".jpg,.jpeg"
            },
            {
                mimeType: "application/pdf",
                extensions: ".pdf"
            },
            {
                mimeType: "text/*",
                extensions: ".html,.txt"
            }
        ];

        expect(parseAllowedFormats(input)).toEqual({
            "image/jpeg": ["jpg", "jpeg"],
            "application/pdf": ["pdf"],
            "text/*": ["html", "txt"]
        });
    });
    test("throws on incorrect mime format", () => {
        const input: AllowedFileFormatsType[] = [
            {
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
                mimeType: "text/*",
                extensions: ".txt,.cvs,abc"
            }
        ];

        expect(() => parseAllowedFormats(input)).toThrow("Value 'txt' is not recognized. Accepted format: '.pdf'");
    });
});

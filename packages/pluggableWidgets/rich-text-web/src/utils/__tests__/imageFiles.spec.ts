import { MAX_FILE_SIZE, formatFileSize, pickImageFiles, readFileAsDataUrl, validateImageFile } from "../imageFiles";

function fileOf(name: string, type: string, size: number): File {
    const file = new File(["x"], name, { type });
    // `File` derives its size from the content, so override it to size the file
    // without allocating megabytes in the test.
    Object.defineProperty(file, "size", { value: size });
    return file;
}

describe("validateImageFile", () => {
    it("rejects files above the maximum size, reporting the actual size", () => {
        const error = validateImageFile(fileOf("huge.png", "image/png", 13_000_000));

        expect(error).toEqual({ key: "image.errorTooLarge", arg: "12.4 MB" });
    });

    it("rejects files that are not images", () => {
        const error = validateImageFile(fileOf("doc.pdf", "application/pdf", 1024));

        expect(error).toEqual({ key: "image.errorNotImage" });
    });

    it("accepts an image within the size limit", () => {
        expect(validateImageFile(fileOf("photo.jpg", "image/jpeg", MAX_FILE_SIZE - 1))).toBeNull();
    });

    it("accepts an image exactly at the size limit", () => {
        expect(validateImageFile(fileOf("photo.jpg", "image/jpeg", MAX_FILE_SIZE))).toBeNull();
    });
});

describe("formatFileSize", () => {
    it.each([
        [512, "512 B"],
        [2048, "2.0 KB"],
        [5 * 1024 * 1024, "5.0 MB"]
    ])("formats %p as %p", (bytes, expected) => {
        expect(formatFileSize(bytes)).toBe(expected);
    });
});

describe("pickImageFiles", () => {
    it("keeps only image files, in their original order", () => {
        const first = fileOf("a.png", "image/png", 10);
        const text = fileOf("notes.txt", "text/plain", 10);
        const second = fileOf("b.gif", "image/gif", 10);

        expect(pickImageFiles([first, text, second])).toEqual([first, second]);
    });

    it("returns an empty list when no file is an image", () => {
        expect(pickImageFiles([fileOf("doc.pdf", "application/pdf", 10)])).toEqual([]);
    });

    it("returns an empty list for missing file lists", () => {
        expect(pickImageFiles(null)).toEqual([]);
        expect(pickImageFiles(undefined)).toEqual([]);
    });
});

describe("readFileAsDataUrl", () => {
    it("resolves with a data URI", async () => {
        const dataUrl = await readFileAsDataUrl(new File(["hello"], "a.png", { type: "image/png" }));

        expect(dataUrl.startsWith("data:image/png;base64,")).toBe(true);
    });

    it("rejects when the file cannot be read", async () => {
        const readAsDataURL = jest.spyOn(FileReader.prototype, "readAsDataURL").mockImplementation(function (
            this: FileReader
        ) {
            this.onerror?.(new ProgressEvent("error") as ProgressEvent<FileReader>);
        });

        await expect(readFileAsDataUrl(new File([""], "a.png", { type: "image/png" }))).rejects.toThrow();

        readAsDataURL.mockRestore();
    });
});

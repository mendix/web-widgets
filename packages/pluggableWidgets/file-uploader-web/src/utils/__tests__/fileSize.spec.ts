import { fileSize } from "../fileSize";

describe("fileSize", () => {
    it("should return '0B' for size 0", () => {
        expect(fileSize(0)).toBe("0 B");
    });

    it("should return '1B' for size 1", () => {
        expect(fileSize(1)).toBe("1 B");
    });

    it("should return '1KB' for size 1024", () => {
        expect(fileSize(1024)).toBe("1 KB");
    });

    it("should return '1MB' for size 1048576 (1024 * 1024)", () => {
        expect(fileSize(1024 * 1024)).toBe("1 MB");
    });

    it("should return '1GB' for size 1073741824 (1024 * 1024 * 1024)", () => {
        expect(fileSize(1024 * 1024 * 1024)).toBe("1 GB");
    });

    it("should handle large sizes correctly", () => {
        expect(fileSize(1024 ** 5.0001)).toBe("1 PB");
    });

    it("empty for negative sizes", () => {
        expect(fileSize(-1)).toBe("");
    });

    it("should return one decimal digit for sizes less than 100", () => {
        expect(fileSize(64.06 * 1024)).toBe("64.1 KB");
        expect(fileSize(85.4 * 1024)).toBe("85.4 KB");
        expect(fileSize(99.9 * 1024)).toBe("99.9 KB");
    });

    it("should return two decimal digits for sizes less than 10", () => {
        expect(fileSize(5.009 * 1024)).toBe("5.01 KB");
        expect(fileSize(9.11 * 1024)).toBe("9.11 KB");
        expect(fileSize(1.91 * 1024)).toBe("1.91 KB");

        expect(fileSize(100.91 * 1024)).toBe("100 KB");
    });

    it("should return the round sizes for sizes below the thresholds", () => {
        expect(fileSize(85.03 * 1024)).toBe("85 KB");
        expect(fileSize(7.001 * 1024)).toBe("7 KB");
        expect(fileSize(70268742)).toBe("67 MB");
    });

    it("should return the correct unit for sizes just below the next threshold", () => {
        expect(fileSize(1023)).toBe("1023 B");
        expect(fileSize(1024 * 1024 - 1)).toBe("1023 KB");
    });
});

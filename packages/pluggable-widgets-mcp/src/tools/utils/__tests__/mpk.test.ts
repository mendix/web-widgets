import { afterEach, describe, expect, it } from "vitest";
import { findMpkFile } from "@/tools/utils/mpk";
import { createTempWidgetWithMpk } from "@/__test-utils__/temp-dir";

describe("findMpkFile", () => {
    const cleanups: Array<() => void> = [];

    afterEach(() => {
        for (const cleanup of cleanups) cleanup();
        cleanups.length = 0;
    });

    it("returns undefined when dist/ does not exist", () => {
        const { dir, cleanup } = createTempWidgetWithMpk({ noDist: true });
        cleanups.push(cleanup);
        expect(findMpkFile(dir)).toBeUndefined();
    });

    it("returns undefined when dist/ exists but has no .mpk", () => {
        const { dir, cleanup } = createTempWidgetWithMpk({ noMpk: true });
        cleanups.push(cleanup);
        expect(findMpkFile(dir)).toBeUndefined();
    });

    it("finds .mpk directly in dist/", () => {
        const { dir, cleanup } = createTempWidgetWithMpk({ mpkName: "MyWidget.mpk" });
        cleanups.push(cleanup);
        const result = findMpkFile(dir);
        expect(result).toBeDefined();
        expect(result).toContain("MyWidget.mpk");
    });

    it("finds .mpk in a nested version directory (dist/1.0.0/)", () => {
        const { dir, cleanup } = createTempWidgetWithMpk({
            mpkName: "MyWidget.mpk",
            versionDir: "1.0.0"
        });
        cleanups.push(cleanup);
        const result = findMpkFile(dir);
        expect(result).toBeDefined();
        expect(result).toContain("1.0.0");
        expect(result).toContain("MyWidget.mpk");
    });

    it("returns undefined when widget path does not exist", () => {
        expect(findMpkFile("/nonexistent/widget/path")).toBeUndefined();
    });
});

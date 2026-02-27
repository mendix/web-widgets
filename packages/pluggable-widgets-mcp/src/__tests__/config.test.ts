import { join } from "node:path";
import { writeFileSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";
import { validateProjectDir } from "@/config";
import { createTempMendixProject } from "@/__test-utils__/temp-dir";

describe("validateProjectDir", () => {
    const cleanups: Array<() => void> = [];

    afterEach(() => {
        for (const cleanup of cleanups) cleanup();
        cleanups.length = 0;
    });

    it("returns invalid for a non-existent directory", async () => {
        const result = await validateProjectDir("/nonexistent/path/to/project");
        expect(result.valid).toBe(false);
        expect(result.error).toContain("does not exist");
    });

    it("returns invalid when directory has no .mpr file", async () => {
        const { dir, cleanup } = createTempMendixProject({ skipMpr: true });
        cleanups.push(cleanup);
        const result = await validateProjectDir(dir);
        expect(result.valid).toBe(false);
        expect(result.error).toContain("No .mpr file");
    });

    it("returns valid with correct projectName for a proper Mendix project", async () => {
        const { dir, cleanup } = createTempMendixProject({ projectName: "MyApp" });
        cleanups.push(cleanup);
        const result = await validateProjectDir(dir);
        expect(result.valid).toBe(true);
        expect(result.projectName).toBe("MyApp");
    });

    it("sets widgetsDir to <dir>/widgets", async () => {
        const { dir, cleanup } = createTempMendixProject();
        cleanups.push(cleanup);
        const result = await validateProjectDir(dir);
        expect(result.widgetsDir).toBe(join(dir, "widgets"));
    });

    it("lists .mpk files from widgets/ directory", async () => {
        const { dir, cleanup } = createTempMendixProject({
            widgets: ["Foo.mpk", "Bar.mpk"]
        });
        cleanups.push(cleanup);
        const result = await validateProjectDir(dir);
        expect(result.existingWidgets).toContain("Foo.mpk");
        expect(result.existingWidgets).toContain("Bar.mpk");
    });

    it("returns empty existingWidgets when widgets/ dir does not exist", async () => {
        const { dir, cleanup } = createTempMendixProject({ skipWidgetsDir: true });
        cleanups.push(cleanup);
        const result = await validateProjectDir(dir);
        expect(result.valid).toBe(true);
        expect(result.existingWidgets).toEqual([]);
    });

    it("filters out non-.mpk files from widgets/", async () => {
        const { dir, cleanup } = createTempMendixProject({ widgets: ["Widget.mpk"] });
        cleanups.push(cleanup);
        // Add a non-mpk file
        writeFileSync(join(dir, "widgets", "readme.txt"), "not a widget");
        const result = await validateProjectDir(dir);
        expect(result.existingWidgets).toEqual(["Widget.mpk"]);
    });
});

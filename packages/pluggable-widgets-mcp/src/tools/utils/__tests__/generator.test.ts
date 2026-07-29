import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ToolContext } from "@/tools/types";
import { buildGeneratorAnswers, runWidgetGenerator } from "@/tools/utils/generator";
import { ProgressTracker } from "@/tools/utils/progress-tracker";

/**
 * The generator's prompt names are an external contract we depend on. If an upstream release
 * renames one, our answer silently stops applying and the prompt's default takes over — a change
 * that produces a working-but-wrong widget rather than an error. Pinning the set turns that into a
 * test failure.
 */
const EXPECTED_PROMPTS = [
    "name",
    "description",
    "organization",
    "copyright",
    "license",
    "version",
    "author",
    "projectPath",
    "programmingLanguage",
    "programmingStyle",
    "platform",
    "boilerplate",
    "hasUnitTests",
    "hasE2eTests"
];

const OPTIONS = {
    name: "ProbeWidget",
    description: "a probe widget",
    version: "1.0.0",
    author: "Mendix",
    license: "Apache-2.0",
    organization: "mendix",
    template: "empty" as const,
    programmingLanguage: "typescript" as const,
    unitTests: false,
    e2eTests: false
};

function stubTracker(): ProgressTracker {
    const context = { sendNotification: async () => undefined } as unknown as ToolContext;
    return new ProgressTracker({ context, logger: "test", totalSteps: 3 });
}

describe("buildGeneratorAnswers", () => {
    it("maps our option names onto the generator's prompt names", () => {
        const answers = buildGeneratorAnswers(OPTIONS, "../");
        expect(answers).toMatchObject({
            name: "ProbeWidget",
            boilerplate: "empty",
            hasUnitTests: false,
            hasE2eTests: false,
            platform: "web",
            programmingStyle: "function"
        });
    });

    it("omits copyright so the generator's current-year default applies", () => {
        expect(buildGeneratorAnswers(OPTIONS, "../")).not.toHaveProperty("copyright");
    });

    it("answers every prompt the generator asks except copyright", () => {
        const supplied = Object.keys(buildGeneratorAnswers(OPTIONS, "../"));
        expect(supplied.sort()).toEqual(EXPECTED_PROMPTS.filter(p => p !== "copyright").sort());
    });
});

describe("runWidgetGenerator", () => {
    let dir: string;
    let stdout: { mock: { calls: unknown[][] } };

    beforeEach(() => {
        dir = mkdtempSync(join(tmpdir(), "gen-test-"));
        // stderr is noisy (the generator logs a banner); silence it but keep stdout observable.
        vi.spyOn(console, "error").mockImplementation(() => undefined);
        stdout = vi.spyOn(process.stdout, "write").mockReturnValue(true);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        rmSync(dir, { recursive: true, force: true });
    });

    it("scaffolds a widget without prompting, and is asked exactly the prompts we pin", async () => {
        const { askedFor } = await runWidgetGenerator(OPTIONS, stubTracker(), dir);

        expect(askedFor).toEqual(EXPECTED_PROMPTS);
        expect(existsSync(join(dir, "src", "ProbeWidget.tsx"))).toBe(true);
        expect(existsSync(join(dir, "src", "ProbeWidget.xml"))).toBe(true);
        expect(existsSync(join(dir, "package.json"))).toBe(true);
    }, 60000);

    it("never writes to stdout — that channel belongs to MCP JSON-RPC", async () => {
        await runWidgetGenerator(OPTIONS, stubTracker(), dir);
        expect(stdout).not.toHaveBeenCalled();
    }, 60000);

    it("does not install dependencies", async () => {
        await runWidgetGenerator(OPTIONS, stubTracker(), dir);
        expect(existsSync(join(dir, "node_modules"))).toBe(false);
    }, 60000);

    it("refuses to scaffold into a non-empty directory", async () => {
        await runWidgetGenerator(OPTIONS, stubTracker(), dir);
        await expect(runWidgetGenerator(OPTIONS, stubTracker(), dir)).rejects.toThrow();
    }, 60000);
});

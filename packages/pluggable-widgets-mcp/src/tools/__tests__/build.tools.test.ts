import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMcpTestContext, getResultText, isError } from "@/__test-utils__/mcp-test-harness";
import { createTempMendixProject } from "@/__test-utils__/temp-dir";
import { formatBuildFailureResponse, formatBuildSuccessResponse, registerBuildTools } from "@/tools/build.tools";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { SessionState } from "@/tools/session-state";

describe("build-widget sandbox expansion", () => {
    let client: Client;
    let state: SessionState;
    let cleanup: () => Promise<void>;
    const tempCleanups: Array<() => void> = [];

    beforeEach(async () => {
        ({ client, state, cleanup } = await createMcpTestContext(registerBuildTools));
    });

    afterEach(async () => {
        await cleanup();
        for (const c of tempCleanups) c();
        tempCleanups.length = 0;
    });

    it("rejects widget path outside allowed directories", async () => {
        // Create a real temp dir (must exist to pass the existsSync check)
        const rogueDir = mkdtempSync(join(tmpdir(), "mcp-test-rogue-"));
        tempCleanups.push(() => rmSync(rogueDir, { recursive: true, force: true }));
        state.projectDir = undefined;
        const result = await client.callTool({
            name: "build-widget",
            arguments: { widgetPath: rogueDir }
        });
        const text = getResultText(result);
        expect(isError(result)).toBe(true);
        expect(text).toContain("not within an allowed directory");
    });

    it("allows widget path within state.projectDir", async () => {
        const { dir, cleanup: tempCleanup } = createTempMendixProject();
        tempCleanups.push(tempCleanup);
        state.projectDir = dir;

        // Create a fake widget dir inside the project with a package.json
        const widgetDir = join(dir, "my-widget");
        mkdirSync(widgetDir, { recursive: true });
        writeFileSync(join(widgetDir, "package.json"), '{"name":"my-widget"}');

        const result = await client.callTool({
            name: "build-widget",
            arguments: { widgetPath: widgetDir }
        });
        const text = getResultText(result);
        // Path check passed — build itself will fail (no real widget), but NOT with sandbox error
        expect(text).not.toContain("not within an allowed directory");
    });
});

describe("formatBuildFailureResponse", () => {
    let tmpDir: string;

    beforeEach(() => {
        tmpDir = mkdtempSync(join(tmpdir(), "mcp-build-test-"));
        mkdirSync(join(tmpDir, "src"), { recursive: true });
    });

    afterEach(() => {
        rmSync(tmpDir, { recursive: true, force: true });
    });

    it("includes all error details in the response", async () => {
        const errors = [
            {
                category: "typescript" as const,
                tsCode: "TS6133",
                message: "'props' is declared but its value is never read.",
                file: "src/Counter.editorPreview.tsx",
                line: 4,
                column: 25
            }
        ];
        writeFileSync(
            join(tmpDir, "src/Counter.editorPreview.tsx"),
            `export function preview(props: CounterPreviewProps) {\n    return <div>[Counter]</div>;\n}\n`
        );

        const response = await formatBuildFailureResponse(errors, tmpDir);

        expect(response).toContain("TS6133");
        expect(response).toContain("'props' is declared but its value is never read.");
        expect(response).toContain("src/Counter.editorPreview.tsx");
        expect(response).toContain("line 4");
        expect(response).toContain("col 25");
    });

    it("embeds content of failing source files in the response", async () => {
        const fileContent = `export function preview(props: CounterPreviewProps) {\n    return <div>[Counter]</div>;\n}\n`;
        writeFileSync(join(tmpDir, "src/Counter.editorPreview.tsx"), fileContent);

        const errors = [
            {
                category: "typescript" as const,
                tsCode: "TS6133",
                message: "'props' is declared but its value is never read.",
                file: "src/Counter.editorPreview.tsx",
                line: 4,
                column: 25
            }
        ];

        const response = await formatBuildFailureResponse(errors, tmpDir);

        expect(response).toContain("export function preview");
        // The separator format "--- <path> ---" is the required output format for this function
        expect(response).toContain("--- src/Counter.editorPreview.tsx ---");
    });

    it("skips file embed when file does not exist on disk", async () => {
        const errors = [
            {
                category: "typescript" as const,
                tsCode: "TS2339",
                message: "Property 'x' does not exist on type 'Y'.",
                file: "src/Nonexistent.tsx",
                line: 10,
                column: 5
            }
        ];

        const response = await formatBuildFailureResponse(errors, tmpDir);

        expect(response).toContain("TS2339");
        expect(response).not.toContain("--- src/Nonexistent.tsx ---");
    });

    it("handles errors with no file location gracefully", async () => {
        const errors = [
            {
                category: "unknown" as const,
                message: "Build failed with exit code 1"
            }
        ];

        const response = await formatBuildFailureResponse(errors, tmpDir);

        expect(response).toContain("Build failed with exit code 1");
        expect(response).not.toContain("--- ");
    });
});

describe("formatBuildSuccessResponse", () => {
    const widgetPath = "/tmp/my-widget";

    it("includes deploy-widget as next step with widgetPath", () => {
        const result = formatBuildSuccessResponse(undefined, widgetPath, []);
        expect(result).toContain("deploy-widget");
        expect(result).toContain(widgetPath);
    });

    it("includes MPK path when available", () => {
        const mpkPath = "/tmp/my-widget/dist/MyWidget.mpk";
        const result = formatBuildSuccessResponse(mpkPath, widgetPath, []);
        expect(result).toContain(mpkPath);
        expect(result).toContain("MPK output");
    });

    it("includes next step even without MPK path", () => {
        const result = formatBuildSuccessResponse(undefined, widgetPath, []);
        expect(result).toContain("Next step");
        expect(result).not.toContain("MPK output");
    });

    it("includes warnings when present", () => {
        const result = formatBuildSuccessResponse(undefined, widgetPath, ["unused variable", "deprecated API"]);
        expect(result).toContain("Warnings");
        expect(result).toContain("unused variable");
        expect(result).toContain("deprecated API");
    });
});

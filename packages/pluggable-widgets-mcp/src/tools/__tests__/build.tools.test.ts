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
        expect(text).toContain("ERR_OUTPUT_PATH_INVALID");
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
        expect(text).not.toContain("ERR_OUTPUT_PATH_INVALID");
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

        const response = formatBuildFailureResponse(errors);

        expect(response).toContain("TS6133");
        expect(response).toContain("'props' is declared but its value is never read.");
        expect(response).toContain("src/Counter.editorPreview.tsx");
        expect(response).toContain("src/Counter.editorPreview.tsx:4:25");
    });

    it("does not embed file contents — the caller reads what it needs", async () => {
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

        const response = formatBuildFailureResponse(errors);

        // The location is enough; embedding whole files was unbounded.
        expect(response).toContain("src/Counter.editorPreview.tsx:4:25");
        expect(response).not.toContain("export function preview");
        expect(response).toContain("read-widget-file");
    });

    it("handles errors with no file location gracefully", async () => {
        const errors = [
            {
                category: "unknown" as const,
                message: "Build failed with exit code 1"
            }
        ];

        const response = formatBuildFailureResponse(errors);

        expect(response).toContain("Build failed with exit code 1");
        expect(response).toContain("Build failed with 1 error(s)");
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
        expect(result).toContain("Output:");
    });

    it("includes next step even without MPK path", () => {
        const result = formatBuildSuccessResponse(undefined, widgetPath, []);
        expect(result).toContain("Next: deploy-widget");
        expect(result).not.toContain("Output:");
    });

    it("includes warnings when present", () => {
        const result = formatBuildSuccessResponse(undefined, widgetPath, ["unused variable", "deprecated API"]);
        expect(result).toContain("Warnings");
        expect(result).toContain("unused variable");
        expect(result).toContain("deprecated API");
    });
});

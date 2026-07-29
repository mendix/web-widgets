import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMcpTestContext, getResultText } from "@/__test-utils__/mcp-test-harness";
import { createTempMendixProject } from "@/__test-utils__/temp-dir";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { SessionState } from "@/tools/session-state";

// Mock the generator so the tool returns immediately after path validation.
// These are plain functions rather than vi.fn(): the suite runs with `restoreMocks: true`, which
// resets a factory-created vi.fn() after the first test and would leave later tests with a stub
// returning undefined.
vi.mock("@/tools/utils/generator", () => ({
    buildWidgetOptions: (args: Record<string, unknown>) => ({
        name: args.name ?? "TestWidget",
        description: args.description ?? "test",
        version: "1.0.0",
        author: "Mendix",
        license: "Apache-2.0",
        organization: "Mendix",
        template: "empty",
        programmingLanguage: "typescript",
        unitTests: true,
        e2eTests: false
    }),
    runWidgetGenerator: () => Promise.resolve({ askedFor: [] }),
    runNpmInstall: () => Promise.resolve({ ok: true }),
    ScaffoldTimeoutError: class ScaffoldTimeoutError extends Error {},
    SCAFFOLD_PROGRESS: {
        START: { progress: 0, message: "Starting..." },
        COMPLETE: { progress: 100, message: "Done!" }
    }
}));

describe("create-widget sandbox expansion", () => {
    let client: Client;
    let state: SessionState;
    let cleanup: () => Promise<void>;
    const tempCleanups: Array<() => void> = [];

    beforeEach(async () => {
        const { registerScaffoldingTools } = await import("@/tools/scaffolding.tools");
        ({ client, state, cleanup } = await createMcpTestContext(registerScaffoldingTools));
    });

    afterEach(async () => {
        await cleanup();
        for (const c of tempCleanups) c();
        tempCleanups.length = 0;
    });

    it("refuses to scaffold when no project is configured", async () => {
        state.projectDir = undefined;
        const result = await client.callTool({
            name: "create-widget",
            arguments: { name: "TestWidget", description: "test" }
        });
        expect(getResultText(result)).toContain("ERR_PROJECT_NOT_CONFIGURED");
    });

    it("rejects an outputPath outside the project directory", async () => {
        const { dir, cleanup: tempCleanup } = createTempMendixProject();
        tempCleanups.push(tempCleanup);
        state.projectDir = dir;

        const result = await client.callTool({
            name: "create-widget",
            arguments: {
                name: "TestWidget",
                description: "test",
                outputPath: "/tmp/evil-path"
            }
        });
        expect(getResultText(result)).toContain("ERR_OUTPUT_PATH_INVALID");
    });

    it("defaults the output to widget-sources inside the project", async () => {
        const { dir, cleanup: tempCleanup } = createTempMendixProject();
        tempCleanups.push(tempCleanup);
        state.projectDir = dir;

        const result = await client.callTool({
            name: "create-widget",
            arguments: { name: "TestWidget", description: "test" }
        });
        expect(getResultText(result)).toContain(join(dir, "widget-sources", "testWidget"));
    });

    it("allows outputPath within state.projectDir", async () => {
        const { dir, cleanup: tempCleanup } = createTempMendixProject();
        tempCleanups.push(tempCleanup);
        state.projectDir = dir;

        const result = await client.callTool({
            name: "create-widget",
            arguments: {
                name: "TestWidget",
                description: "test",
                outputPath: dir + "/sub"
            }
        });
        const text = getResultText(result);
        // Path check passed — the mocked generator runs instantly.
        expect(text).not.toContain("ERR_OUTPUT_PATH_INVALID");
        expect(text).toContain(`Created widget "TestWidget"`);
    });
});

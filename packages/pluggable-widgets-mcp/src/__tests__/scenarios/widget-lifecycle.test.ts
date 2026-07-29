/**
 * Integration scenario tests that simulate complete Maia workflows.
 * Uses the recording harness to verify tool ordering and state transitions.
 * The generator is mocked so tests run fast without Yeoman scaffolding.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMcpTestContext, getResultText, isError } from "@/__test-utils__/mcp-test-harness";
import { createTempMendixProject } from "@/__test-utils__/temp-dir";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { SessionState } from "@/tools/session-state";

vi.mock("@/tools/utils/generator", () => ({
    buildWidgetOptions: (args: Record<string, unknown>) => ({
        name: args.name ?? "ScenarioWidget",
        description: args.description ?? "scenario test",
        version: "1.0.0",
        author: "Mendix",
        license: "Apache-2.0",
        organization: "Mendix",
        template: "empty",
        programmingLanguage: "typescript",
        unitTests: false,
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

describe("discovery workflow", () => {
    let client: Client;
    let state: SessionState;
    let cleanup: () => Promise<void>;
    const tempCleanups: Array<() => void> = [];

    beforeEach(async () => {
        ({ client, state, cleanup } = await createMcpTestContext());
    });

    afterEach(async () => {
        await cleanup();
        for (const c of tempCleanups) c();
        tempCleanups.length = 0;
    });

    it("get-project-info (no project) → set-project-directory → get-project-info (success)", async () => {
        // Step 1: get-project-info with no project configured
        const noProjectResult = await client.callTool({ name: "get-project-info", arguments: {} });
        expect(isError(noProjectResult)).toBe(true);
        expect(getResultText(noProjectResult)).toContain("ERR_PROJECT_NOT_CONFIGURED");

        // Step 2: set-project-directory with a valid project
        const { dir, cleanup: tempCleanup } = createTempMendixProject({ projectName: "DiscoveryApp" });
        tempCleanups.push(tempCleanup);

        const setResult = await client.callTool({
            name: "set-project-directory",
            arguments: { projectDir: dir }
        });
        expect(isError(setResult)).toBe(false);
        expect(state.projectDir).toBe(dir);

        // Step 3: get-project-info now succeeds with project name
        const infoResult = await client.callTool({ name: "get-project-info", arguments: {} });
        expect(isError(infoResult)).toBe(false);
        expect(getResultText(infoResult)).toContain("DiscoveryApp");
    });
});

describe("scaffold workflow", () => {
    let client: Client;
    let state: SessionState;
    let cleanup: () => Promise<void>;
    const tempCleanups: Array<() => void> = [];

    beforeEach(async () => {
        const { registerScaffoldingTools } = await import("@/tools/scaffolding.tools");
        const { registerFileOperationTools } = await import("@/tools/file-operations.tools");
        ({ client, state, cleanup } = await createMcpTestContext(registerScaffoldingTools, registerFileOperationTools));
    });

    afterEach(async () => {
        await cleanup();
        for (const c of tempCleanups) c();
        tempCleanups.length = 0;
    });

    it("set-project-directory → create-widget returns valid path", async () => {
        const { dir, cleanup: tempCleanup } = createTempMendixProject();
        tempCleanups.push(tempCleanup);
        state.projectDir = dir;

        // create-widget with outputPath inside projectDir (passes sandbox check)
        const outputPath = dir + "/widgets-out";
        const createResult = await client.callTool({
            name: "create-widget",
            arguments: {
                name: "ScenarioWidget",
                description: "scenario test",
                outputPath
            }
        });
        expect(isError(createResult)).toBe(false);
        const text = getResultText(createResult);
        expect(text).toContain("ScenarioWidget");
        expect(text).toContain(`Created widget "ScenarioWidget"`);
    });
});

describe("error recovery", () => {
    let client: Client;
    let state: SessionState;
    let cleanup: () => Promise<void>;
    const tempCleanups: Array<() => void> = [];

    beforeEach(async () => {
        ({ client, state, cleanup } = await createMcpTestContext());
    });

    afterEach(async () => {
        await cleanup();
        for (const c of tempCleanups) c();
        tempCleanups.length = 0;
    });

    it("get-project-info on invalid path → returns structured error with suggestion", async () => {
        state.projectDir = "/nonexistent/path/to/project";

        const result = await client.callTool({ name: "get-project-info", arguments: {} });
        expect(isError(result)).toBe(true);
        const text = getResultText(result);

        // Error is structured and actionable
        expect(text).toContain("ERR_PROJECT_NOT_CONFIGURED");
        expect(text).toContain("Suggestion");
    });

    it("set-project-directory with invalid path → state unchanged, actionable error returned", async () => {
        state.projectDir = undefined;

        const result = await client.callTool({
            name: "set-project-directory",
            arguments: { projectDir: "/completely/nonexistent" }
        });
        expect(isError(result)).toBe(true);
        expect(state.projectDir).toBeUndefined();
        const text = getResultText(result);
        expect(text).toContain("ERR_PROJECT_NOT_CONFIGURED");

        // Retry with valid path
        const { dir, cleanup: tempCleanup } = createTempMendixProject();
        tempCleanups.push(tempCleanup);

        const retryResult = await client.callTool({
            name: "set-project-directory",
            arguments: { projectDir: dir }
        });
        expect(isError(retryResult)).toBe(false);
        expect(state.projectDir).toBe(dir);
    });
});

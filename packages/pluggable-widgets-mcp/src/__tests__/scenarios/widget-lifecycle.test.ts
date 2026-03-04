/**
 * Integration scenario tests that simulate complete Maia workflows.
 * Uses the recording harness to verify tool ordering and state transitions.
 * The generator is mocked so tests run fast without Yeoman scaffolding.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    createMcpTestContext,
    createRecordingMcpTestContext,
    getResultText,
    isError
} from "@/__test-utils__/mcp-test-harness";
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
    runWidgetGenerator: vi.fn().mockResolvedValue(undefined),
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
        expect(text).toContain("created successfully");
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

describe("protocol recording captures tool sequence", () => {
    let cleanup: () => Promise<void>;
    const tempCleanups: Array<() => void> = [];

    afterEach(async () => {
        await cleanup();
        for (const c of tempCleanups) c();
        tempCleanups.length = 0;
    });

    it("records tool calls in order and assertToolOrder passes", async () => {
        const ctx = await createRecordingMcpTestContext();
        cleanup = ctx.cleanup;

        const { dir, cleanup: tempCleanup } = createTempMendixProject({ projectName: "RecordingApp" });
        tempCleanups.push(tempCleanup);

        // Call two tools in sequence
        await ctx.client.callTool({ name: "get-project-info", arguments: {} });
        ctx.state.projectDir = dir;
        await ctx.client.callTool({ name: "get-project-info", arguments: {} });

        // Verify recording captured both calls
        const sequence = ctx.getToolCallSequence();
        expect(sequence.length).toBeGreaterThanOrEqual(2);
        expect(sequence[0]).toBe("get-project-info");
        expect(sequence[1]).toBe("get-project-info");

        // assertToolOrder should not throw
        expect(() => ctx.assertToolOrder(["get-project-info", "get-project-info"])).not.toThrow();
    });

    it("records messages in both directions", async () => {
        const ctx = await createRecordingMcpTestContext();
        cleanup = ctx.cleanup;

        const { dir, cleanup: tempCleanup } = createTempMendixProject();
        tempCleanups.push(tempCleanup);
        ctx.state.projectDir = dir;

        await ctx.client.callTool({ name: "get-project-info", arguments: {} });

        const clientToServer = ctx.records.filter(r => r.direction === "client-to-server");
        const serverToClient = ctx.records.filter(r => r.direction === "server-to-client");

        expect(clientToServer.length).toBeGreaterThan(0);
        expect(serverToClient.length).toBeGreaterThan(0);
    });

    it("getToolCalls returns name and arguments", async () => {
        const ctx = await createRecordingMcpTestContext();
        cleanup = ctx.cleanup;

        const { dir, cleanup: tempCleanup } = createTempMendixProject();
        tempCleanups.push(tempCleanup);

        await ctx.client.callTool({
            name: "set-project-directory",
            arguments: { projectDir: dir }
        });

        const toolCalls = ctx.getToolCalls();
        expect(toolCalls).toHaveLength(1);
        expect(toolCalls[0].name).toBe("set-project-directory");
        expect((toolCalls[0].arguments as Record<string, unknown>).projectDir).toBe(dir);
        expect(toolCalls[0].timestamp).toBeGreaterThan(0);
    });

    it("assertToolOrder throws when sequence is wrong", async () => {
        const ctx = await createRecordingMcpTestContext();
        cleanup = ctx.cleanup;

        const { dir, cleanup: tempCleanup } = createTempMendixProject();
        tempCleanups.push(tempCleanup);
        ctx.state.projectDir = dir;

        await ctx.client.callTool({ name: "get-project-info", arguments: {} });

        expect(() => ctx.assertToolOrder(["set-project-directory"])).toThrow();
    });
});

import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMcpTestContext, getResultText, isError } from "@/__test-utils__/mcp-test-harness";
import { createTempMendixProject } from "@/__test-utils__/temp-dir";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { SessionState } from "@/tools/session-state";

describe("get-project-info", () => {
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

    it("returns error when no project is configured", async () => {
        state.projectDir = undefined;
        const result = await client.callTool({ name: "get-project-info", arguments: {} });
        expect(isError(result)).toBe(true);
        expect(getResultText(result)).toContain("ERR_PROJECT_NOT_CONFIGURED");
    });

    it("returns error when project dir is invalid", async () => {
        state.projectDir = "/nonexistent/project";
        const result = await client.callTool({ name: "get-project-info", arguments: {} });
        expect(isError(result)).toBe(true);
        const text = getResultText(result);
        expect(text).toContain("ERR_PROJECT_NOT_CONFIGURED");
        expect(text).toContain("invalid");
    });

    it("returns project info for a valid project", async () => {
        const { dir, cleanup: tempCleanup } = createTempMendixProject({
            projectName: "DemoApp",
            widgets: ["SomeWidget.mpk"]
        });
        tempCleanups.push(tempCleanup);
        state.projectDir = dir;

        const result = await client.callTool({ name: "get-project-info", arguments: {} });
        expect(isError(result)).toBe(false);
        const text = getResultText(result);
        expect(text).toContain("DemoApp");
        expect(text).toContain("SomeWidget.mpk");
    });
});

describe("set-project-directory", () => {
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

    it("sets project dir for a valid Mendix project", async () => {
        const { dir, cleanup: tempCleanup } = createTempMendixProject();
        tempCleanups.push(tempCleanup);

        const result = await client.callTool({
            name: "set-project-directory",
            arguments: { projectDir: dir }
        });
        expect(isError(result)).toBe(false);
        expect(state.projectDir).toBe(dir);
    });

    it("returns error for non-existent directory", async () => {
        const originalDir = state.projectDir;
        const result = await client.callTool({
            name: "set-project-directory",
            arguments: { projectDir: "/nope/not/real" }
        });
        expect(isError(result)).toBe(true);
        expect(state.projectDir).toBe(originalDir);
    });

    it("returns error for directory without .mpr file", async () => {
        const { dir, cleanup: tempCleanup } = createTempMendixProject({ skipMpr: true });
        tempCleanups.push(tempCleanup);

        const result = await client.callTool({
            name: "set-project-directory",
            arguments: { projectDir: dir }
        });
        expect(isError(result)).toBe(true);
        expect(getResultText(result)).toContain("No .mpr");
    });
});

describe("deploy-widget", () => {
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

    it("returns error when no project is configured", async () => {
        state.projectDir = undefined;
        const result = await client.callTool({
            name: "deploy-widget",
            arguments: { widgetPath: "/some/widget" }
        });
        expect(isError(result)).toBe(true);
        expect(getResultText(result)).toContain("ERR_PROJECT_NOT_CONFIGURED");
    });

    it("returns error when widget has no .mpk in dist/", async () => {
        const { dir: projectDir, cleanup: pc } = createTempMendixProject();
        tempCleanups.push(pc);
        state.projectDir = projectDir;
        // Create widget dir inside projectDir (passes sandbox) with empty dist/
        const widgetDir = join(projectDir, "my-widget");
        mkdirSync(join(widgetDir, "dist"), { recursive: true });

        const result = await client.callTool({
            name: "deploy-widget",
            arguments: { widgetPath: widgetDir }
        });
        expect(isError(result)).toBe(true);
        expect(getResultText(result)).toContain("ERR_MPK_NOT_FOUND");
    });

    it("returns error when widget has no dist/ at all", async () => {
        const { dir: projectDir, cleanup: pc } = createTempMendixProject();
        tempCleanups.push(pc);
        state.projectDir = projectDir;
        // Create widget dir inside projectDir (passes sandbox) with no dist/
        const widgetDir = join(projectDir, "my-widget");
        mkdirSync(widgetDir, { recursive: true });

        const result = await client.callTool({
            name: "deploy-widget",
            arguments: { widgetPath: widgetDir }
        });
        expect(isError(result)).toBe(true);
        expect(getResultText(result)).toContain("ERR_MPK_NOT_FOUND");
    });

    it("deploys .mpk to project widgets/ directory", async () => {
        const { dir: projectDir, cleanup: pc } = createTempMendixProject();
        tempCleanups.push(pc);
        state.projectDir = projectDir;
        // Create widget dir inside projectDir with a .mpk
        const widgetDir = join(projectDir, "my-widget");
        mkdirSync(join(widgetDir, "dist"), { recursive: true });
        writeFileSync(join(widgetDir, "dist", "Cool.mpk"), "fake-mpk-content");

        const result = await client.callTool({
            name: "deploy-widget",
            arguments: { widgetPath: widgetDir }
        });
        expect(isError(result)).toBe(false);
        expect(getResultText(result)).toContain("deployed");
        expect(existsSync(join(projectDir, "widgets", "Cool.mpk"))).toBe(true);
    });

    it("creates widgets/ directory if it does not exist", async () => {
        const { dir: projectDir, cleanup: pc } = createTempMendixProject({
            skipWidgetsDir: true
        });
        tempCleanups.push(pc);
        state.projectDir = projectDir;
        // Create widget dir inside projectDir with a .mpk
        const widgetDir = join(projectDir, "my-widget");
        mkdirSync(join(widgetDir, "dist"), { recursive: true });
        writeFileSync(join(widgetDir, "dist", "New.mpk"), "fake-mpk-content");

        const result = await client.callTool({
            name: "deploy-widget",
            arguments: { widgetPath: widgetDir }
        });
        expect(isError(result)).toBe(false);
        expect(existsSync(join(projectDir, "widgets", "New.mpk"))).toBe(true);
    });

    it("rejects widgetPath outside allowed directories", async () => {
        const { dir: projectDir, cleanup: pc } = createTempMendixProject();
        // Create a rogue dir outside projectDir and GENERATIONS_DIR
        const rogueDir = mkdtempSync(join(tmpdir(), "mcp-test-rogue-"));
        mkdirSync(join(rogueDir, "dist"), { recursive: true });
        writeFileSync(join(rogueDir, "dist", "Evil.mpk"), "fake-mpk-content");
        tempCleanups.push(pc, () => rmSync(rogueDir, { recursive: true, force: true }));
        state.projectDir = projectDir;

        const result = await client.callTool({
            name: "deploy-widget",
            arguments: { widgetPath: rogueDir }
        });
        expect(isError(result)).toBe(true);
        expect(getResultText(result)).toContain("not within an allowed directory");
    });
});

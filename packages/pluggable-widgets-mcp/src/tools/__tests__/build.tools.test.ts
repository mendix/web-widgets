import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMcpTestContext, getResultText, isError } from "@/__test-utils__/mcp-test-harness";
import { createTempMendixProject } from "@/__test-utils__/temp-dir";
import { registerBuildTools } from "@/tools/build.tools";
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

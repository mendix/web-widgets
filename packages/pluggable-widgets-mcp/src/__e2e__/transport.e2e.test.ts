/**
 * Transport-level invariants that only a real process can demonstrate.
 *
 * Under stdio, stdout carries JSON-RPC. A single stray byte on that stream — a generator banner, a
 * forgotten console.log — corrupts the connection to Studio Pro. The unit suite cannot see this at
 * all: it runs client and server in one process over InMemoryTransport, where stdout is irrelevant.
 */

import { afterEach, describe, expect, it } from "vitest";
import { spawn } from "node:child_process";
import { rmSync } from "node:fs";
import { PACKAGE_ROOT } from "@/config";
import { SERVER_ENTRY, startRawStdioSession, startStdioServer, waitFor } from "./support/harness";
import { makeProjectDir } from "./support/warm-cache";

const EXPECTED_TOOLS = [
    "build-widget",
    "create-widget",
    "deploy-widget",
    "get-project-info",
    "list-widget-files",
    "read-widget-file",
    "set-project-directory",
    "set-widget-properties",
    "write-widget-file"
];

describe("stdio transport", () => {
    const cleanups: string[] = [];

    afterEach(() => {
        for (const dir of cleanups) rmSync(dir, { recursive: true, force: true });
        cleanups.length = 0;
    });

    it("advertises exactly the nine pipeline tools and both guideline resources", async () => {
        const projectDir = makeProjectDir();
        cleanups.push(projectDir);

        const server = await startStdioServer({ projectDir });
        try {
            expect(await server.listToolNames()).toEqual(EXPECTED_TOOLS);
            expect(await server.listResourceUris()).toEqual([
                "mendix://guidelines/property-types",
                "mendix://guidelines/widget-patterns"
            ]);
        } finally {
            await server.close();
        }
    });

    it("writes nothing but JSON-RPC to stdout", async () => {
        const projectDir = makeProjectDir();
        cleanups.push(projectDir);

        const session = startRawStdioSession(projectDir);
        session.send({
            jsonrpc: "2.0",
            id: 1,
            method: "initialize",
            params: {
                protocolVersion: "2024-11-05",
                capabilities: {},
                clientInfo: { name: "purity-probe", version: "1.0.0" }
            }
        });

        await waitFor(() => session.stdout().includes("\n"));
        session.child.kill();
        await session.exited;

        const lines = session.stdout().split("\n").filter(Boolean);
        expect(lines.length, "server produced no stdout at all").toBeGreaterThan(0);

        for (const line of lines) {
            // Anything that is not a JSON-RPC frame would desynchronise the client's parser.
            const parsed = JSON.parse(line) as { jsonrpc?: string };
            expect(parsed.jsonrpc, `non-JSON-RPC line on stdout: ${line}`).toBe("2.0");
        }

        // Logging still has to go somewhere, and stderr is where Studio Pro collects it.
        expect(session.stderr().length).toBeGreaterThan(0);
    });

    it("exits when its parent closes stdin, instead of orphaning", async () => {
        const projectDir = makeProjectDir();
        cleanups.push(projectDir);

        const session = startRawStdioSession(projectDir);
        await waitFor(() => session.stderr().includes("Connected") || session.stderr().length > 0);

        session.child.stdin.end();

        const code = await Promise.race([
            session.exited,
            new Promise<"timeout">(resolve => setTimeout(() => resolve("timeout"), 15_000))
        ]);

        expect(code, "server did not exit after stdin closed — it would orphan when Studio Pro dies").not.toBe(
            "timeout"
        );
    });
});

describe("command line", () => {
    /** Runs the entry point and resolves with its exit code and combined output. */
    function run(args: string[]): Promise<{ code: number | null; output: string }> {
        return new Promise(resolve => {
            const child = spawn(process.execPath, [SERVER_ENTRY, ...args], {
                cwd: PACKAGE_ROOT,
                env: { PATH: process.env.PATH ?? "", HOME: process.env.HOME ?? "" }
            });
            let output = "";
            child.stdout.on("data", (c: Buffer) => (output += c.toString()));
            child.stderr.on("data", (c: Buffer) => (output += c.toString()));
            child.on("close", code => resolve({ code, output }));
        });
    }

    it("rejects an unknown transport instead of silently defaulting to stdio", async () => {
        const { code, output } = await run(["htpp"]);

        expect(code).not.toBe(0);
        expect(output).toContain("htpp");
    });

    it("prints usage for --help", async () => {
        const { code, output } = await run(["--help"]);

        expect(code).toBe(0);
        expect(output).toContain("stdio");
        expect(output).toContain("http");
    });
});

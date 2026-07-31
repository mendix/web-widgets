/**
 * Drives the built server the way Studio Pro does: as a real child process over a real transport.
 *
 * This is the whole reason the e2e suite exists. `src/__test-utils__/mcp-test-harness.ts` runs a
 * client and server in one process over InMemoryTransport, which is right for the fast suite but
 * cannot see anything about spawning, packaging, argv handling, stdout hygiene or process
 * lifecycle — the failure modes that actually break the Studio Pro integration.
 *
 * Specs run against `dist/`, not `src/`. Build before running, or you are testing the previous
 * version of the server.
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { type ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { PACKAGE_ROOT } from "@/config";
import type { Timeline } from "./timeline";

export const SERVER_ENTRY = join(PACKAGE_ROOT, "dist", "index.js");

/** Fails with an actionable message rather than a confusing ENOENT from deep inside the SDK. */
export function assertBuilt(): void {
    if (!existsSync(SERVER_ENTRY)) {
        throw new Error(`${SERVER_ENTRY} does not exist. Run "npm run build" before the e2e suite.`);
    }
}

export interface ToolCallResult {
    text: string;
    isError: boolean;
    ms: number;
}

export interface E2EServer {
    client: Client;
    /** Calls a tool and returns its flattened text plus how long it took. */
    call(name: string, args?: Record<string, unknown>): Promise<ToolCallResult>;
    listToolNames(): Promise<string[]>;
    listResourceUris(): Promise<string[]>;
    close(): Promise<void>;
}

export interface StartServerOptions {
    projectDir: string;
    /** Where to spawn the process from. The sandbox must not depend on this — see failure-modes. */
    cwd?: string;
    /** When given, every call is filed under a phase name matching the tool. */
    timeline?: Timeline;
    env?: Record<string, string>;
}

/**
 * Starts the server over stdio and returns a connected client.
 *
 * `env` is passed explicitly rather than inherited wholesale: MENDIX_PROJECT_DIR leaking in from the
 * developer's shell would silently point specs at a real project.
 */
export async function startStdioServer(options: StartServerOptions): Promise<E2EServer> {
    assertBuilt();

    const transport = new StdioClientTransport({
        command: process.execPath,
        args: [SERVER_ENTRY, "stdio"],
        cwd: options.cwd ?? PACKAGE_ROOT,
        env: {
            PATH: process.env.PATH ?? "",
            HOME: process.env.HOME ?? "",
            MENDIX_PROJECT_DIR: options.projectDir,
            MCP_LOG_LEVEL: process.env.MCP_LOG_LEVEL ?? "warn",
            ...options.env
        },
        stderr: "pipe"
    });

    const client = new Client({ name: "e2e-harness", version: "1.0.0" });
    await client.connect(transport);

    const call = async (name: string, args: Record<string, unknown> = {}): Promise<ToolCallResult> => {
        const started = Date.now();
        const invoke = async (): Promise<ToolCallResult> => {
            const result = await client.callTool({ name, arguments: args }, undefined, { timeout: 600_000 });
            const content = (result.content ?? []) as Array<{ type: string; text?: string }>;
            return {
                text: content.map(c => c.text ?? `[${c.type}]`).join("\n"),
                isError: result.isError === true,
                ms: Date.now() - started
            };
        };

        return options.timeline ? options.timeline.record(name, invoke) : invoke();
    };

    return {
        client,
        call,
        listToolNames: async () => (await client.listTools()).tools.map(t => t.name).sort(),
        listResourceUris: async () => (await client.listResources()).resources.map(r => r.uri).sort(),
        close: () => client.close()
    };
}

export interface RawStdioSession {
    child: ChildProcessWithoutNullStreams;
    /** Everything the server wrote to stdout. */
    stdout(): string;
    stderr(): string;
    send(message: unknown): void;
    /** Resolves with the exit code once the process ends. */
    exited: Promise<number | null>;
}

/**
 * Spawns the server without the SDK client in the way, so a spec can inspect raw stdout.
 *
 * The SDK's transport consumes stdout to parse frames, which makes it impossible to assert that
 * *nothing else* was written there. Under stdio that channel carries JSON-RPC, so a stray banner or
 * console.log corrupts the connection to Studio Pro — an invariant worth testing directly.
 */
export function startRawStdioSession(projectDir: string): RawStdioSession {
    assertBuilt();

    const child = spawn(process.execPath, [SERVER_ENTRY, "stdio"], {
        cwd: PACKAGE_ROOT,
        env: {
            PATH: process.env.PATH ?? "",
            HOME: process.env.HOME ?? "",
            MENDIX_PROJECT_DIR: projectDir,
            MCP_LOG_LEVEL: "debug" // maximise the chance of catching a logger writing to the wrong stream
        },
        stdio: ["pipe", "pipe", "pipe"]
    }) as ChildProcessWithoutNullStreams;

    let out = "";
    let err = "";
    child.stdout.on("data", (chunk: Buffer) => (out += chunk.toString()));
    child.stderr.on("data", (chunk: Buffer) => (err += chunk.toString()));

    const exited = new Promise<number | null>(resolve => child.on("close", code => resolve(code)));

    return {
        child,
        stdout: () => out,
        stderr: () => err,
        send: (message: unknown) => child.stdin.write(`${JSON.stringify(message)}\n`),
        exited
    };
}

/** Polls until `predicate` holds or the budget runs out. Avoids arbitrary sleeps in specs. */
export async function waitFor(predicate: () => boolean, budgetMs = 10_000, stepMs = 50): Promise<boolean> {
    const deadline = Date.now() + budgetMs;
    while (Date.now() < deadline) {
        if (predicate()) return true;
        await new Promise(resolve => setTimeout(resolve, stepMs));
    }
    return predicate();
}

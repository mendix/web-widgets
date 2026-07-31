/**
 * The paths that matter when something is wrong.
 *
 * A pipeline that works when everything is correct is easy. What decides whether a model can use
 * this server is whether a failure tells it enough to recover: which file, which line, which
 * argument. And whether a refusal is actually a refusal.
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { type E2EServer, startStdioServer } from "./support/harness";
import { applyBadgeFixture } from "./support/fixture-widget";
import { ensureWarmCache, makeProjectDir, materializeWarmWidget, WARM_WIDGET_NAME } from "./support/warm-cache";

describe("build failures", () => {
    let projectDir: string;
    let widgetPath: string;
    let server: E2EServer;

    beforeAll(async () => {
        const cache = await ensureWarmCache();
        projectDir = makeProjectDir();
        widgetPath = materializeWarmWidget(cache, projectDir);
        server = await startStdioServer({ projectDir });

        // Start from a widget that builds, so the only error the build reports is the one injected
        // below. Otherwise the first failure comes from the scaffold's own preview files.
        await applyBadgeFixture(server, widgetPath);
    });

    afterAll(async () => {
        await server?.close();
        if (projectDir) rmSync(projectDir, { recursive: true, force: true });
    });

    it("reports the exact file, line and column for a type error", async () => {
        await server.call("write-widget-file", {
            widgetPath,
            filePath: `src/${WARM_WIDGET_NAME}.tsx`,
            content: [
                `import { ReactElement } from "react";`,
                `import { ${WARM_WIDGET_NAME}ContainerProps } from "../typings/${WARM_WIDGET_NAME}Props";`,
                ``,
                `export function ${WARM_WIDGET_NAME}(props: ${WARM_WIDGET_NAME}ContainerProps): ReactElement {`,
                `    const broken: number = props.badgeType;`,
                `    return <div>{broken}</div>;`,
                `}`,
                ``
            ].join("\n")
        });

        const result = await server.call("build-widget", { widgetPath });

        expect(result.isError).toBe(true);
        expect(result.text).toContain("ERR_BUILD_FAILED");
        // A location, not just "the build failed" — this is what lets a model fix it unaided.
        expect(result.text).toMatch(new RegExp(`src/${WARM_WIDGET_NAME}\\.tsx:\\d+:\\d+`));
    });

    it("does not embed file contents in the failure, only locations", async () => {
        const result = await server.call("build-widget", { widgetPath });

        expect(result.isError).toBe(true);
        // Inlining sources was unbounded; read-widget-file exists for that.
        expect(result.text).not.toContain("export function");
        expect(result.text.length).toBeLessThan(4000);
    });
});

describe("refusals", () => {
    let projectDir: string;
    let widgetPath: string;
    let server: E2EServer;

    beforeAll(async () => {
        const cache = await ensureWarmCache();
        projectDir = makeProjectDir();
        widgetPath = materializeWarmWidget(cache, projectDir);
        server = await startStdioServer({ projectDir });
    });

    afterAll(async () => {
        await server?.close();
        if (projectDir) rmSync(projectDir, { recursive: true, force: true });
    });

    it("refuses to write outside the widget directory", async () => {
        const result = await server.call("write-widget-file", {
            widgetPath,
            filePath: "../../../../../../tmp/mcp-escape-probe.tsx",
            content: "export const escaped = true;\n"
        });

        expect(result.isError).toBe(true);
        expect(existsSync("/tmp/mcp-escape-probe.tsx")).toBe(false);
    });

    it("refuses a disallowed file extension", async () => {
        const result = await server.call("write-widget-file", {
            widgetPath,
            filePath: "src/payload.sh",
            content: "#!/bin/sh\necho hi\n"
        });

        expect(result.isError).toBe(true);
        expect(existsSync(join(widgetPath, "src", "payload.sh"))).toBe(false);
    });

    it("rejects duplicate property keys and writes nothing", async () => {
        const before = readFileSync(join(widgetPath, "src", `${WARM_WIDGET_NAME}.xml`), "utf-8");

        const result = await server.call("set-widget-properties", {
            widgetPath,
            description: "duplicate keys",
            properties: [
                { key: "value", type: "string", caption: "First" },
                { key: "value", type: "string", caption: "Second" }
            ]
        });

        expect(result.isError).toBe(true);
        expect(result.text).toContain("ERR_INVALID_DEFINITION");
        expect(readFileSync(join(widgetPath, "src", `${WARM_WIDGET_NAME}.xml`), "utf-8")).toBe(before);
    });

    it("refuses to deploy a widget that has not been built", async () => {
        rmSync(join(widgetPath, "dist"), { recursive: true, force: true });

        const result = await server.call("deploy-widget", { widgetPath });

        expect(result.isError).toBe(true);
    });
});

describe("the sandbox boundary does not move with the working directory", () => {
    let projectDir: string;
    let widgetPath: string;
    let elsewhere: string;

    beforeAll(async () => {
        const cache = await ensureWarmCache();
        projectDir = makeProjectDir();
        widgetPath = materializeWarmWidget(cache, projectDir);
        elsewhere = mkdtempSync(join(tmpdir(), "mcp-e2e-elsewhere-"));
    });

    afterAll(() => {
        rmSync(projectDir, { recursive: true, force: true });
        rmSync(elsewhere, { recursive: true, force: true });
    });

    /**
     * The regression test for the bug that motivated the refactor: the sandbox root used to derive
     * from process.cwd(), so the fence moved depending on who spawned the server. Studio Pro spawns
     * it from its own install directory.
     */
    it.each([
        ["the package directory", undefined],
        ["an unrelated directory", () => elsewhere]
    ])("refuses an escape when started from %s", async (_label, cwdFn) => {
        const server = await startStdioServer({ projectDir, cwd: cwdFn?.() });
        try {
            const probe = join(elsewhere, "escaped.tsx");
            const result = await server.call("write-widget-file", {
                widgetPath,
                filePath: `../../../../../..${probe}`,
                content: "export const escaped = true;\n"
            });

            expect(result.isError).toBe(true);
            expect(existsSync(probe)).toBe(false);

            // And the project itself is still writable from either cwd — a fence that refuses
            // everything is not a fence, it is a broken server.
            const legitimate = await server.call("write-widget-file", {
                widgetPath,
                filePath: "src/ui/boundary-probe.scss",
                content: ".probe { color: red; }\n"
            });
            expect(legitimate.isError).toBe(false);
        } finally {
            await server.close();
        }
    });
});

describe("project configuration", () => {
    it("fails every tool with a recoverable error when no project is configured", async () => {
        const server = await startStdioServer({ projectDir: "" });
        try {
            const result = await server.call("get-project-info");

            expect(result.isError).toBe(true);
            expect(result.text).toContain("ERR_PROJECT_NOT_CONFIGURED");
            expect(result.text).toContain("set-project-directory");
        } finally {
            await server.close();
        }
    });

    it("refuses a directory that is not a Mendix project", async () => {
        const notAProject = mkdtempSync(join(tmpdir(), "mcp-e2e-not-a-project-"));
        writeFileSync(join(notAProject, "README.md"), "no .mpr here\n");

        const server = await startStdioServer({ projectDir: "" });
        try {
            const result = await server.call("set-project-directory", { projectDir: notAProject });
            expect(result.isError).toBe(true);
        } finally {
            await server.close();
            rmSync(notAProject, { recursive: true, force: true });
        }
    });
});

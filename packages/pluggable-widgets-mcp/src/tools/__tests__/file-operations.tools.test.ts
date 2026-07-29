import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMcpTestContext, getResultText, isError } from "@/__test-utils__/mcp-test-harness";
import { registerFileOperationTools } from "@/tools/file-operations.tools";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";

describe("file operation tools", () => {
    let client: Client;
    let cleanup: () => Promise<void>;
    let widget: string;

    beforeEach(async () => {
        ({ client, cleanup } = await createMcpTestContext(registerFileOperationTools));
        widget = mkdtempSync(join(tmpdir(), "file-ops-"));
        mkdirSync(join(widget, "src"), { recursive: true });
    });

    afterEach(async () => {
        await cleanup();
        rmSync(widget, { recursive: true, force: true });
    });

    describe("list-widget-files", () => {
        it("lists files relative to the widget directory", async () => {
            writeFileSync(join(widget, "src", "Widget.tsx"), "x");
            writeFileSync(join(widget, "package.json"), "{}");

            const text = getResultText(
                await client.callTool({ name: "list-widget-files", arguments: { widgetPath: widget } })
            );

            expect(text).toContain(join("src", "Widget.tsx"));
            expect(text).toContain("package.json");
        });

        it("skips node_modules and build output", async () => {
            mkdirSync(join(widget, "node_modules", "pkg"), { recursive: true });
            writeFileSync(join(widget, "node_modules", "pkg", "index.js"), "x");
            mkdirSync(join(widget, "dist"), { recursive: true });
            writeFileSync(join(widget, "dist", "bundle.js"), "x");

            const text = getResultText(
                await client.callTool({ name: "list-widget-files", arguments: { widgetPath: widget } })
            );

            expect(text).not.toContain("node_modules");
            expect(text).not.toContain("bundle.js");
        });

        it("fails for a path that is not a directory", async () => {
            const file = join(widget, "src", "Widget.tsx");
            writeFileSync(file, "x");

            const result = await client.callTool({ name: "list-widget-files", arguments: { widgetPath: file } });
            expect(isError(result)).toBe(true);
        });
    });

    describe("read-widget-file", () => {
        it("returns file content", async () => {
            writeFileSync(join(widget, "src", "Widget.tsx"), "export const x = 1;");

            const text = getResultText(
                await client.callTool({
                    name: "read-widget-file",
                    arguments: { widgetPath: widget, filePath: "src/Widget.tsx" }
                })
            );

            expect(text).toContain("export const x = 1;");
        });

        it("refuses to read outside the widget directory", async () => {
            const result = await client.callTool({
                name: "read-widget-file",
                arguments: { widgetPath: widget, filePath: "../../../etc/passwd" }
            });

            expect(isError(result)).toBe(true);
            expect(getResultText(result)).toContain("ERR_FILE_READ");
        });
    });

    describe("write-widget-file", () => {
        it("writes a single file and creates missing parent directories", async () => {
            const result = await client.callTool({
                name: "write-widget-file",
                arguments: {
                    widgetPath: widget,
                    filePath: "src/components/Nested.tsx",
                    content: "export const nested = true;"
                }
            });

            expect(isError(result)).toBe(false);
            expect(readFileSync(join(widget, "src", "components", "Nested.tsx"), "utf-8")).toContain("nested");
        });

        it("writes a batch of files", async () => {
            await client.callTool({
                name: "write-widget-file",
                arguments: {
                    widgetPath: widget,
                    files: [
                        { relativePath: "src/A.tsx", content: "a" },
                        { relativePath: "src/B.tsx", content: "b" }
                    ]
                }
            });

            expect(readFileSync(join(widget, "src", "A.tsx"), "utf-8")).toBe("a");
            expect(readFileSync(join(widget, "src", "B.tsx"), "utf-8")).toBe("b");
        });

        it("rejects a disallowed extension, writing nothing", async () => {
            const result = await client.callTool({
                name: "write-widget-file",
                arguments: { widgetPath: widget, filePath: "src/evil.exe", content: "x" }
            });

            expect(isError(result)).toBe(true);
            expect(getResultText(result)).toContain("ERR_FILE_WRITE");
        });

        it("validates every path before writing any of them", async () => {
            // The second entry is invalid; the first must not reach disk.
            await client.callTool({
                name: "write-widget-file",
                arguments: {
                    widgetPath: widget,
                    files: [
                        { relativePath: "src/Good.tsx", content: "good" },
                        { relativePath: "../escape.tsx", content: "bad" }
                    ]
                }
            });

            expect(() => readFileSync(join(widget, "src", "Good.tsx"), "utf-8")).toThrow();
        });
    });
});

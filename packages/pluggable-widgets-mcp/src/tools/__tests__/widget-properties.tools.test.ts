import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMcpTestContext, getResultText, isError } from "@/__test-utils__/mcp-test-harness";
import { registerWidgetPropertiesTools } from "@/tools/widget-properties.tools";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";

/** Creates a scaffolded-looking widget directory with the given package.json widgetName. */
function createWidgetDir(widgetName?: string): string {
    const dir = mkdtempSync(join(tmpdir(), "widget-props-"));
    mkdirSync(join(dir, "src"), { recursive: true });
    if (widgetName) {
        writeFileSync(join(dir, "package.json"), JSON.stringify({ widgetName }));
    }
    return dir;
}

describe("set-widget-properties", () => {
    let client: Client;
    let cleanup: () => Promise<void>;
    const dirs: string[] = [];

    beforeEach(async () => {
        ({ client, cleanup } = await createMcpTestContext(registerWidgetPropertiesTools));
    });

    afterEach(async () => {
        await cleanup();
        for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
        dirs.length = 0;
    });

    it("writes the widget XML from the property model", async () => {
        const dir = createWidgetDir("Counter");
        dirs.push(dir);

        const result = await client.callTool({
            name: "set-widget-properties",
            arguments: {
                widgetPath: dir,
                description: "a counter",
                properties: [
                    { key: "value", type: "attribute", caption: "Value", attributeTypes: ["Integer"] },
                    { key: "onIncrement", type: "action", caption: "On Increment" }
                ]
            }
        });

        expect(isError(result)).toBe(false);

        const xml = readFileSync(join(dir, "src", "Counter.xml"), "utf-8");
        expect(xml).toContain('key="value"');
        expect(xml).toContain('type="attribute"');
        expect(xml).toContain('key="onIncrement"');
        expect(xml).toContain('<attributeType name="Integer"');
    });

    it("takes the widget name from package.json, not the directory name", async () => {
        // The directory is a temp name like widget-props-xxxx, which would fail PascalCase
        // validation if it were used as the widget name.
        const dir = createWidgetDir("Badge");
        dirs.push(dir);

        await client.callTool({
            name: "set-widget-properties",
            arguments: {
                widgetPath: dir,
                description: "a badge",
                properties: [{ key: "label", type: "textTemplate", caption: "Label" }]
            }
        });

        expect(readFileSync(join(dir, "src", "Badge.xml"), "utf-8")).toContain('key="label"');
    });

    it("is declarative — a second call replaces the previous property set", async () => {
        const dir = createWidgetDir("Counter");
        dirs.push(dir);

        const call = (properties: unknown[]): Promise<unknown> =>
            client.callTool({
                name: "set-widget-properties",
                arguments: { widgetPath: dir, description: "a counter", properties }
            });

        await call([
            { key: "first", type: "string", caption: "First" },
            { key: "second", type: "string", caption: "Second" }
        ]);
        await call([{ key: "second", type: "string", caption: "Second" }]);

        const xml = readFileSync(join(dir, "src", "Counter.xml"), "utf-8");
        expect(xml).toContain('key="second"');
        expect(xml).not.toContain('key="first"');
    });

    it("rejects an invalid definition without writing anything", async () => {
        const dir = createWidgetDir("Counter");
        dirs.push(dir);

        const result = await client.callTool({
            name: "set-widget-properties",
            arguments: {
                widgetPath: dir,
                description: "duplicate keys",
                properties: [
                    { key: "value", type: "string", caption: "One" },
                    { key: "value", type: "string", caption: "Two" }
                ]
            }
        });

        expect(isError(result)).toBe(true);
        expect(getResultText(result)).toContain("nothing was written");
        expect(() => readFileSync(join(dir, "src", "Counter.xml"), "utf-8")).toThrow();
    });

    it("rejects a property key that is not camelCase", async () => {
        const dir = createWidgetDir("Counter");
        dirs.push(dir);

        const result = await client.callTool({
            name: "set-widget-properties",
            arguments: {
                widgetPath: dir,
                description: "bad key",
                properties: [{ key: "Value", type: "string", caption: "Value" }]
            }
        });

        expect(isError(result)).toBe(true);
    });
});

/**
 * The happy path, start to finish, against a real server process.
 *
 * The assertions deliberately go past "the tool returned success": the XML is compared to a golden
 * file and validated against Mendix's own schema, and the .mpk is opened and its contents checked.
 * A build reporting success while producing an archive Studio Pro cannot load is exactly the class
 * of failure this suite exists to catch.
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { PACKAGE_ROOT } from "@/config";
import { type E2EServer, startStdioServer } from "./support/harness";
import { appendTimingRow, formatSummary, Timeline } from "./support/timeline";
import { ensureWarmCache, makeProjectDir, materializeWarmWidget, WARM_WIDGET_NAME } from "./support/warm-cache";
import { readZipEntryNames } from "./support/zip";

const FIXTURES = join(PACKAGE_ROOT, "src", "__e2e__", "fixtures");
const GOLDENS = join(PACKAGE_ROOT, "src", "__e2e__", "goldens");

interface BadgeFixture {
    description: string;
    properties: unknown[];
    systemProperties: string[];
}

const badge = JSON.parse(readFileSync(join(FIXTURES, "badge.properties.json"), "utf-8")) as BadgeFixture;
const component = readFileSync(join(FIXTURES, "badge.component.tsx.txt"), "utf-8");

/** xmllint ships with macOS and most Linux images, but is not guaranteed. */
function hasXmllint(): boolean {
    try {
        execFileSync("xmllint", ["--version"], { stdio: "ignore" });
        return true;
    } catch {
        return false;
    }
}

describe("full pipeline", () => {
    const timeline = new Timeline();
    let projectDir: string;
    let widgetPath: string;
    let server: E2EServer;

    beforeAll(async () => {
        const cache = await ensureWarmCache();
        projectDir = makeProjectDir();
        widgetPath = materializeWarmWidget(cache, projectDir);
        server = await startStdioServer({ projectDir, timeline });
    });

    afterAll(async () => {
        await server?.close();
        if (projectDir) rmSync(projectDir, { recursive: true, force: true });

        const row = timeline.toRow("warm");
        appendTimingRow(row);
        process.stderr.write(`${formatSummary(row)}\n`);
    });

    it("get-project-info finds the project and reports its widgets", async () => {
        const result = await server.call("get-project-info");

        expect(result.isError).toBe(false);
        expect(result.text).toContain("E2eApp");
    });

    it("set-widget-properties writes XML matching the golden file", async () => {
        const result = await server.call("set-widget-properties", {
            widgetPath,
            description: badge.description,
            properties: badge.properties,
            systemProperties: badge.systemProperties
        });

        expect(result.isError).toBe(false);

        const written = readFileSync(join(widgetPath, "src", `${WARM_WIDGET_NAME}.xml`), "utf-8");
        const goldenPath = join(GOLDENS, `${WARM_WIDGET_NAME}.xml`);

        // Regenerating the golden is a deliberate act, not a side effect of running the suite: a
        // self-healing golden asserts nothing.
        if (!existsSync(goldenPath)) {
            mkdirSync(dirname(goldenPath), { recursive: true });
            writeFileSync(goldenPath, written, "utf-8");
            throw new Error(
                `No golden file existed, so one was written to ${goldenPath}. Review it and commit it, then re-run.`
            );
        }

        expect(written).toBe(readFileSync(goldenPath, "utf-8"));
    });

    it.skipIf(!hasXmllint())("the generated XML validates against the Mendix widget schema", () => {
        const xsd = join(widgetPath, "node_modules", "mendix", "custom_widget.xsd");
        expect(existsSync(xsd)).toBe(true);

        // Throws on a validation failure; the message carries the offending line.
        execFileSync("xmllint", ["--noout", "--schema", xsd, join(widgetPath, "src", `${WARM_WIDGET_NAME}.xml`)], {
            stdio: "pipe"
        });
    });

    it("write-widget-file writes the component, and read-widget-file returns it unchanged", async () => {
        const write = await server.call("write-widget-file", {
            widgetPath,
            files: [
                { relativePath: `src/${WARM_WIDGET_NAME}.tsx`, content: component },
                {
                    relativePath: `src/ui/${WARM_WIDGET_NAME}.scss`,
                    content: ".widget-probebadge {\n    display: inline-flex;\n    gap: 4px;\n}\n"
                },
                {
                    relativePath: `src/${WARM_WIDGET_NAME}.editorPreview.tsx`,
                    content: `import { ReactElement } from "react";\nimport { ${WARM_WIDGET_NAME}PreviewProps } from "../typings/${WARM_WIDGET_NAME}Props";\n\nexport function preview({ value }: ${WARM_WIDGET_NAME}PreviewProps): ReactElement {\n    return <div className="widget-probebadge">{value}</div>;\n}\n`
                },
                {
                    relativePath: `src/${WARM_WIDGET_NAME}.editorConfig.ts`,
                    content: `import { ${WARM_WIDGET_NAME}PreviewProps } from "../typings/${WARM_WIDGET_NAME}Props";\n\nexport function getProperties(_values: ${WARM_WIDGET_NAME}PreviewProps, defaultProperties: unknown): unknown {\n    return defaultProperties;\n}\n`
                }
            ]
        });

        expect(write.isError).toBe(false);

        const read = await server.call("read-widget-file", {
            widgetPath,
            filePath: `src/${WARM_WIDGET_NAME}.tsx`
        });
        expect(read.isError).toBe(false);
        expect(read.text).toContain("executeAction");
        expect(read.text).toContain(`export function ${WARM_WIDGET_NAME}`);
    });

    it("build-widget produces an .mpk Studio Pro can load", async () => {
        const result = await server.call("build-widget", { widgetPath });

        expect(result.isError).toBe(false);

        const match = /(\S+\.mpk)/.exec(result.text);
        expect(match, `no .mpk path in the build output:\n${result.text}`).not.toBeNull();

        const mpkPath = match![1];
        expect(existsSync(mpkPath)).toBe(true);

        // The archive layout is what determines whether the widget loads, so check inside it.
        const entries = readZipEntryNames(readFileSync(mpkPath));
        expect(entries).toContain(`${WARM_WIDGET_NAME}.xml`);
        expect(entries).toContain("package.xml");
        expect(entries.some(e => e.endsWith(`${WARM_WIDGET_NAME}.js`))).toBe(true);
    });

    it("deploy-widget copies the .mpk into the project, and reports a replacement on redeploy", async () => {
        const first = await server.call("deploy-widget", { widgetPath });
        expect(first.isError).toBe(false);
        expect(first.text).toContain("Deployed");

        const deployed = join(projectDir, "widgets", `mendix.${WARM_WIDGET_NAME}.mpk`);
        expect(existsSync(deployed)).toBe(true);

        const second = await server.call("deploy-widget", { widgetPath });
        expect(second.isError).toBe(false);
        expect(second.text).toContain("Replaced");
    });
});

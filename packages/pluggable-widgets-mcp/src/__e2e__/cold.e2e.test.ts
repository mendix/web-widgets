/**
 * From nothing to a deployed widget, with no cache and a real dependency install.
 *
 * This is the run the headline number comes from — "a working Mendix widget in N seconds" — so it
 * deliberately shares nothing with the warm specs. It needs the network, takes the better part of a
 * minute, and is skipped unless E2E_COLD is set.
 *
 * Everything the warm suite proves about behaviour is proved there. What this adds is the two things
 * a cache necessarily hides: that scaffolding actually works against the published generator, and
 * what the whole thing really costs.
 */

import { afterAll, describe, expect, it } from "vitest";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startStdioServer } from "./support/harness";
import { readBadgeComponent, readBadgeFixture, supportingFiles } from "./support/fixture-widget";
import { appendTimingRow, formatSummary, Timeline } from "./support/timeline";
import { readZipEntryNames } from "./support/zip";

const COLD = process.env.E2E_COLD === "1";
const WIDGET_NAME = "ProbeBadge";
const WIDGET_FOLDER = "probeBadge";

describe.skipIf(!COLD)("from scratch, with a real install", () => {
    const timeline = new Timeline();
    let projectDir: string | undefined;

    afterAll(() => {
        if (projectDir) rmSync(projectDir, { recursive: true, force: true });

        const row = timeline.toRow("cold");
        appendTimingRow(row);
        process.stderr.write(`${formatSummary(row)}\n`);
    });

    it("scaffolds, defines, writes, builds and deploys a widget", async () => {
        projectDir = mkdtempSync(join(tmpdir(), "mcp-e2e-cold-"));
        mkdirSync(join(projectDir, "widgets"), { recursive: true });
        writeFileSync(join(projectDir, "ColdApp.mpr"), "");

        const server = await startStdioServer({ projectDir, timeline });

        try {
            const created = await server.call("create-widget", {
                name: WIDGET_NAME,
                description: "A badge that displays a text value and can trigger an action on click",
                organization: "mendix",
                programmingLanguage: "typescript",
                template: "empty",
                unitTests: false,
                e2eTests: false
            });

            expect(created.isError, created.text).toBe(false);
            expect(created.text).toContain("Dependencies installed.");

            // Scaffolding belongs to the project, not to wherever the server happens to be running.
            const widgetPath = join(projectDir, "widget-sources", WIDGET_FOLDER);
            expect(existsSync(join(widgetPath, "package.json"))).toBe(true);
            expect(
                (JSON.parse(readFileSync(join(widgetPath, "package.json"), "utf-8")) as { widgetName: string })
                    .widgetName
            ).toBe(WIDGET_NAME);

            const fixture = readBadgeFixture();
            const properties = await server.call("set-widget-properties", { widgetPath, ...fixture });
            expect(properties.isError, properties.text).toBe(false);

            const written = await server.call("write-widget-file", {
                widgetPath,
                files: [{ relativePath: `src/${WIDGET_NAME}.tsx`, content: readBadgeComponent() }, ...supportingFiles()]
            });
            expect(written.isError, written.text).toBe(false);

            const built = await server.call("build-widget", { widgetPath });
            expect(built.isError, built.text).toBe(false);

            const mpk = /(\S+\.mpk)/.exec(built.text)?.[1];
            expect(mpk).toBeDefined();
            expect(readZipEntryNames(readFileSync(mpk!))).toContain(`${WIDGET_NAME}.xml`);

            const deployed = await server.call("deploy-widget", { widgetPath });
            expect(deployed.isError, deployed.text).toBe(false);
            expect(existsSync(join(projectDir, "widgets", `mendix.${WIDGET_NAME}.mpk`))).toBe(true);
        } finally {
            await server.close();
        }
    });

    it("spends its time where we claim it does", () => {
        // The pitch rests on this: the server's own steps are milliseconds, and the wall-clock is
        // npm and the Mendix toolchain. If that ever stops being true, the claim needs rewriting.
        for (const phase of ["set-widget-properties", "write-widget-file", "deploy-widget"]) {
            expect(timeline.get(phase) ?? 0, `${phase} took longer than a moment`).toBeLessThan(1000);
        }

        expect(timeline.get("create-widget") ?? 0).toBeGreaterThan(0);
        expect(timeline.get("build-widget") ?? 0).toBeGreaterThan(0);
    });
});

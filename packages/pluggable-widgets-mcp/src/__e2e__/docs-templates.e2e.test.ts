/**
 * Compiles every code template in docs/widget-patterns.md against real Mendix typings.
 *
 * That document is not documentation in the decorative sense. It is served to the client model as
 * an MCP resource and is where the component code comes from, so a template that does not compile
 * is a broken product — the model writes it, the build fails, and the failure looks like the user's
 * fault.
 *
 * The templates are extracted verbatim. Nothing is patched on the way through: if a spec has to
 * massage a template to make it compile, the template is what needs fixing.
 *
 * This spec is the one that would have caught templates importing
 * @mendix/widget-plugin-platform — a package that resolves inside the web-widgets monorepo through
 * workspace linking and returns 404 from npm, which no amount of type-checking inside that monorepo
 * would ever reveal.
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DOCS_DIR, PACKAGE_ROOT } from "@/config";
import { type E2EServer, startStdioServer } from "./support/harness";
import { ensureWarmCache, makeProjectDir, materializeWarmWidget, typescriptCompiler } from "./support/warm-cache";

const PATTERNS_DOC = join(DOCS_DIR, "widget-patterns.md");
const FIXTURES = join(PACKAGE_ROOT, "src", "__e2e__", "fixtures");

interface Template {
    name: string;
    line: number;
    code: string;
}

interface PatternModel {
    description: string;
    properties: unknown[];
    systemProperties?: string[];
}

/**
 * Pulls every fenced block out of the document and keeps the tsx ones that declare an exported
 * component. Illustrative snippets — a handler, an import list — are not components and are not
 * independently compilable, so they are skipped by construction rather than by a hand-kept list.
 */
function extractTemplates(markdown: string): Template[] {
    const lines = markdown.split("\n");
    const templates: Template[] = [];

    for (let i = 0; i < lines.length; i++) {
        const fence = /^```(\w+)?\s*$/.exec(lines[i]);
        if (!fence) continue;

        let end = i + 1;
        while (end < lines.length && !/^```\s*$/.test(lines[end])) end++;

        if (fence[1] === "tsx") {
            const code = lines.slice(i + 1, end).join("\n");
            const declared = /export\s+(?:default\s+)?function\s+(\w+)\s*\(/.exec(code);
            if (declared) {
                templates.push({ name: declared[1], line: i + 2, code });
            }
        }
        i = end;
    }

    return templates;
}

describe("widget-patterns.md templates compile", () => {
    const models = (
        JSON.parse(readFileSync(join(FIXTURES, "doc-patterns.json"), "utf-8")) as {
            patterns: Record<string, PatternModel>;
        }
    ).patterns;

    const templates = extractTemplates(readFileSync(PATTERNS_DOC, "utf-8"));

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

    it("finds templates in the document", () => {
        expect(
            templates.length,
            "no component templates found — has the document's structure changed?"
        ).toBeGreaterThan(0);
    });

    it("has a property model for every template", () => {
        const missing = templates.map(t => t.name).filter(name => !(name in models));

        expect(
            missing,
            `Templates with no entry in fixtures/doc-patterns.json would be silently skipped. Add a model for: ${missing.join(", ")}`
        ).toEqual([]);
    });

    it("compiles every template against typings generated from real XML", async () => {
        const src = join(widgetPath, "src");

        // Start from a clean src: the fixture widget's own component would otherwise be compiled
        // alongside the templates and could mask, or invent, an error.
        for (const entry of readdirSync(src)) {
            if (entry.endsWith(".tsx") || entry.endsWith(".ts") || entry.endsWith(".xml")) {
                if (entry !== "package.xml") unlinkSync(join(src, entry));
            }
        }

        // Each template needs its own widget XML, and set-widget-properties derives the widget name
        // from package.json — so each gets a throwaway directory declaring that name. Going through
        // the real tool means the XML under test is the XML the server actually produces.
        for (const template of templates) {
            const model = models[template.name];
            const defDir = join(projectDir, "widget-sources", `.doc-${template.name}`);
            mkdirSync(join(defDir, "src"), { recursive: true });
            writeFileSync(
                join(defDir, "package.json"),
                JSON.stringify({ name: template.name.toLowerCase(), widgetName: template.name }, null, 2)
            );

            const result = await server.call("set-widget-properties", {
                widgetPath: defDir,
                description: model.description,
                properties: model.properties,
                ...(model.systemProperties ? { systemProperties: model.systemProperties } : {})
            });
            expect(result.isError, `could not build XML for ${template.name}:\n${result.text}`).toBe(false);

            copyFileSync(join(defDir, "src", `${template.name}.xml`), join(src, `${template.name}.xml`));
            writeFileSync(join(src, `${template.name}.tsx`), `${template.code}\n`);

            // The templates import a stylesheet next to themselves; create it so resolution is real.
            mkdirSync(join(src, "ui"), { recursive: true });
            writeFileSync(join(src, "ui", `${template.name}.scss`), `.widget-${template.name.toLowerCase()} {\n}\n`);
        }

        // The typings generator reads package.xml, so every widget has to be listed there.
        writeFileSync(
            join(src, "package.xml"),
            [
                `<?xml version="1.0" encoding="utf-8" ?>`,
                `<package xmlns="http://www.mendix.com/package/1.0/">`,
                `    <clientModule name="DocTemplates" version="1.0.0" xmlns="http://www.mendix.com/clientModule/1.0/">`,
                `        <widgetFiles>`,
                ...templates.map(t => `            <widgetFile path="${t.name}.xml"/>`),
                `        </widgetFiles>`,
                `        <files>`,
                `            <file path="mendix/doctemplates"/>`,
                `        </files>`,
                `    </clientModule>`,
                `</package>`,
                ``
            ].join("\n")
        );

        // Runs in a child process with cwd set to the widget — see generate-typings.mjs.
        execFileSync(
            process.execPath,
            [join(PACKAGE_ROOT, "src", "__e2e__", "support", "generate-typings.mjs"), widgetPath],
            {
                cwd: widgetPath,
                stdio: "pipe"
            }
        );

        let output = "";
        let failed = false;
        try {
            // Addressed directly rather than through npx: the widget's node_modules/.bin entries are
            // symlinks written by npm, and resolving them depends on where the install happened.
            execFileSync(process.execPath, [typescriptCompiler(widgetPath), "--noEmit"], {
                cwd: widgetPath,
                encoding: "utf-8",
                stdio: "pipe"
            });
        } catch (error) {
            failed = true;
            const e = error as { stdout?: string; stderr?: string };
            output = `${e.stdout ?? ""}${e.stderr ?? ""}`;
        }

        const located = templates.map(t => `${t.name} (widget-patterns.md line ${t.line})`).join(", ");
        expect(failed, `Templates do not compile. Checked: ${located}\n\n${output}`).toBe(false);
    });
});

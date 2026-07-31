/**
 * Scaffold once, reuse many times.
 *
 * A real `create-widget` costs 20-40 seconds, almost all of it `npm install`. Paying that per spec
 * would make the suite something people skip. Instead one real scaffold is cached and each spec gets
 * a fresh copy of it.
 *
 * The copy is real in every way that matters: the Mendix build toolchain runs against it for real
 * and produces a real .mpk. Only the install is shared. `node_modules` is symlinked rather than
 * copied — duplicating tens of thousands of files would cost more than the install it saves.
 *
 * The cache key includes the generator version, so bumping @mendix/generator-widget invalidates it
 * automatically and the next run re-scaffolds against the new template.
 */

import { createRequire } from "node:module";
import {
    cpSync,
    existsSync,
    mkdirSync,
    mkdtempSync,
    readdirSync,
    readFileSync,
    rmSync,
    symlinkSync,
    writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PACKAGE_ROOT } from "@/config";
import { startStdioServer } from "./harness";
import type { Timeline } from "./timeline";

export const CACHE_ROOT = join(PACKAGE_ROOT, ".e2e-cache");

/** Fixed across the suite so goldens and typings paths stay stable. */
export const WARM_WIDGET_NAME = "ProbeBadge";
const WARM_WIDGET_FOLDER = "probeBadge";

function generatorVersion(): string {
    try {
        const require = createRequire(join(PACKAGE_ROOT, "package.json"));
        const pkgPath = require.resolve("@mendix/generator-widget/package.json");
        return (JSON.parse(readFileSync(pkgPath, "utf-8")) as { version: string }).version;
    } catch {
        return "unknown";
    }
}

function cacheKey(): string {
    return `${generatorVersion()}-typescript-empty`;
}

/** A minimal directory the server will accept as a Mendix project. */
export function makeProjectDir(): string {
    const dir = mkdtempSync(join(tmpdir(), "mcp-e2e-project-"));
    mkdirSync(join(dir, "widgets"), { recursive: true });
    mkdirSync(join(dir, "widget-sources"), { recursive: true });
    writeFileSync(join(dir, "E2eApp.mpr"), "");
    return dir;
}

/**
 * Ensures the cached scaffold exists, creating it with a real `create-widget` call if not.
 *
 * Population goes through the tool rather than calling the generator directly, so even the cache
 * warm-up exercises the real path. Returns the cached widget directory.
 */
export async function ensureWarmCache(timeline?: Timeline): Promise<string> {
    // The cache directory doubles as a Mendix project, so the widget is scaffolded straight into its
    // final home. Scaffolding elsewhere and copying looked simpler but is not: npm writes absolute
    // symlinks into node_modules/.bin, so a copied cache points its tsc and pluggable-widgets-tools
    // at a temp directory that no longer exists, and fails in a way that reads like a broken build.
    const projectRoot = join(CACHE_ROOT, cacheKey());
    const cachedWidget = join(projectRoot, "widget-sources", WARM_WIDGET_FOLDER);

    if (existsSync(join(cachedWidget, "package.json")) && existsSync(join(cachedWidget, "node_modules"))) {
        return cachedWidget;
    }

    // A half-populated cache is worse than none: a failed install leaves a widget that cannot build,
    // and every later spec blames the change under test.
    rmSync(projectRoot, { recursive: true, force: true });
    mkdirSync(join(projectRoot, "widgets"), { recursive: true });
    mkdirSync(join(projectRoot, "widget-sources"), { recursive: true });
    writeFileSync(join(projectRoot, "E2eApp.mpr"), "");

    const server = await startStdioServer({ projectDir: projectRoot, timeline });
    try {
        const result = await server.call("create-widget", {
            name: WARM_WIDGET_NAME,
            description: "Fixture widget for the pluggable-widgets-mcp end-to-end suite",
            organization: "mendix",
            programmingLanguage: "typescript",
            template: "empty",
            unitTests: false,
            e2eTests: false
        });

        if (result.isError) {
            rmSync(projectRoot, { recursive: true, force: true });
            throw new Error(`could not populate the e2e warm cache:\n${result.text}`);
        }
    } finally {
        await server.close();
    }

    return cachedWidget;
}

/** The TypeScript compiler inside the cached install, addressed directly. */
export function typescriptCompiler(widgetPath: string): string {
    return join(widgetPath, "node_modules", "typescript", "bin", "tsc");
}

/**
 * Copies the cached scaffold into `projectDir/widget-sources/` and returns the widget path.
 *
 * Everything except node_modules is copied, so a spec can freely rewrite sources; node_modules is
 * symlinked, so the build resolves pluggable-widgets-tools without a multi-second copy.
 */
export function materializeWarmWidget(cacheDir: string, projectDir: string): string {
    const target = join(projectDir, "widget-sources", WARM_WIDGET_FOLDER);
    rmSync(target, { recursive: true, force: true });
    mkdirSync(target, { recursive: true });

    for (const entry of readdirSync(cacheDir)) {
        if (entry === "node_modules" || entry === "dist") continue;
        cpSync(join(cacheDir, entry), join(target, entry), { recursive: true });
    }

    symlinkSync(join(cacheDir, "node_modules"), join(target, "node_modules"), "dir");
    return target;
}

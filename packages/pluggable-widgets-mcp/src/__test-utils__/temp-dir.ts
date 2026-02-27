import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

interface TempMendixProjectOptions {
    projectName?: string;
    widgets?: string[];
    skipMpr?: boolean;
    skipWidgetsDir?: boolean;
}

interface TempWidgetOptions {
    mpkName?: string;
    versionDir?: string;
    noMpk?: boolean;
    noDist?: boolean;
}

interface TempDirResult {
    dir: string;
    cleanup: () => void;
}

/**
 * Creates a temp directory that looks like a Mendix project.
 * Includes a .mpr file and optionally a widgets/ dir with .mpk files.
 */
export function createTempMendixProject(opts: TempMendixProjectOptions = {}): TempDirResult {
    const dir = mkdtempSync(join(tmpdir(), "mcp-test-project-"));
    const projectName = opts.projectName ?? "TestProject";

    if (!opts.skipMpr) {
        writeFileSync(join(dir, `${projectName}.mpr`), "");
    }

    if (!opts.skipWidgetsDir) {
        const widgetsDir = join(dir, "widgets");
        mkdirSync(widgetsDir, { recursive: true });

        if (opts.widgets) {
            for (const w of opts.widgets) {
                writeFileSync(join(widgetsDir, w), "");
            }
        }
    }

    return {
        dir,
        cleanup: () => rmSync(dir, { recursive: true, force: true })
    };
}

/**
 * Creates a temp directory that looks like a built widget.
 * Includes a dist/ dir with an optional .mpk file (possibly nested in a version dir).
 */
export function createTempWidgetWithMpk(opts: TempWidgetOptions = {}): TempDirResult {
    const dir = mkdtempSync(join(tmpdir(), "mcp-test-widget-"));
    const mpkName = opts.mpkName ?? "TestWidget.mpk";

    if (!opts.noDist) {
        const distDir = join(dir, "dist");
        mkdirSync(distDir, { recursive: true });

        if (!opts.noMpk) {
            const mpkDir = opts.versionDir ? join(distDir, opts.versionDir) : distDir;
            mkdirSync(mpkDir, { recursive: true });
            writeFileSync(join(mpkDir, mpkName), "fake-mpk-content");
        }
    }

    return {
        dir,
        cleanup: () => rmSync(dir, { recursive: true, force: true })
    };
}

#!/usr/bin/env ts-node-script

import { mkdir, readdir, lstat, symlink, unlink } from "fs/promises";
import path from "node:path";

async function ensureSymlink(targetRel: string, linkPath: string): Promise<void> {
    try {
        const stat = await lstat(linkPath).catch(() => null);
        if (stat) {
            await unlink(linkPath);
        }
        await symlink(targetRel, linkPath);
    } catch (err) {
        console.error(`Failed to create symlink for ${linkPath}:`, err);
    }
}

async function main(): Promise<void> {
    const repoRoot = path.resolve(process.cwd(), "../..");
    const SRC_DIR = path.join(repoRoot, "docs", "requirements");
    const CURSOR_DIR = path.join(repoRoot, ".cursor", "rules");
    const WINDSURF_DIR = path.join(repoRoot, ".windsurf", "rules");

    // Ensure target directories exist
    await Promise.all([mkdir(CURSOR_DIR, { recursive: true }), mkdir(WINDSURF_DIR, { recursive: true })]);

    const files = (await readdir(SRC_DIR)).filter(f => f.endsWith(".md"));

    await Promise.all(
        files.map(async file => {
            const base = path.basename(file, ".md");
            const srcAbsolute = path.join(SRC_DIR, file);

            const cursorLink = path.join(CURSOR_DIR, `${base}.mdc`);
            const windsurfLink = path.join(WINDSURF_DIR, `${base}.md`);

            const relFromCursor = path.relative(path.dirname(cursorLink), srcAbsolute);
            const relFromWindsurf = path.relative(path.dirname(windsurfLink), srcAbsolute);

            await Promise.all([ensureSymlink(relFromCursor, cursorLink), ensureSymlink(relFromWindsurf, windsurfLink)]);
        })
    );

    console.log("Agent rules links updated.");
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});

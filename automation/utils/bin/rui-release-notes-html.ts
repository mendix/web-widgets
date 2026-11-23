#!/usr/bin/env node

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { gh } from "../src/github.ts";
import { releaseNotesToHtml } from "../src/release-notes-html.ts";

async function readMarkdown(source: string | undefined): Promise<string> {
    if (!source) {
        throw new Error("Usage: rui-release-notes-html <markdown file | GitHub release tag>");
    }
    if (existsSync(source)) {
        return readFile(source, "utf8");
    }
    await gh.ensureAuth();
    const release = await gh.getReleaseByTag(source);
    if (!release) {
        throw new Error(`'${source}' is neither a file nor a GitHub release tag`);
    }
    return release.body ?? "";
}

async function main(): Promise<void> {
    process.env.FETCH_QUIET = "true";
    console.log(releaseNotesToHtml(await readMarkdown(process.argv[2])));
}

main().catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});

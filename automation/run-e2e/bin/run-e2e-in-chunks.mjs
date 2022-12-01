#!/usr/bin/env node

import c from "ansi-colors";
import { execSync } from "node:child_process";
import parseArgs from "yargs-parser";
import assert from "node:assert/strict";

function main() {
    const parseArgsOptions = {
        number: ["index", "chunks"],
        string: ["event-name"],
        coerce: {},
        default: {
            chunks: 3,
            "event-name": "push"
        }
    };

    const options = parseArgs(process.argv.slice(2), parseArgsOptions);
    const index = validateParam(options.index, "index");
    const chunks = validateParam(options.chunks, "chunks");
    const eventName = options.eventName;

    if (index < 0 || index >= chunks) {
        const message = `Out of range. Received: index - ${index}, chunks - ${chunks}`;
        throw new Error(message);
    }

    const packages = getPackages({ onlyChanged: eventName === "pull_request" });
    const chunkSize = Math.ceil(packages.length / chunks);
    const start = index * chunkSize;
    const end = start + chunkSize;
    const sorted = [...packages].sort((a, b) => a.name.normalize().localeCompare(b.name.normalize()));
    const filters = sorted.slice(start, end).map(pkg => `--filter=${pkg.name}`);
    const command = [
        // <- prevent format in one line
        `pnpm`,
        `--workspace-root`,
        `exec`,
        `turbo run e2e`,
        // turbo options
        `--concurrency=1`,
        ...filters
    ].join(" ");

    // Run e2e only we have packages in chunk
    if (filters.length > 0) {
        execSync(command, { stdio: "inherit" });
    } else {
        console.log(c.yellow("No packages in chunk, skip e2e."));
    }
}

main();

function validateParam(value, option) {
    const n = parseInt(value, 10);
    assert.notStrictEqual(n, NaN, `option ${option} should be integer`);
    assert.ok(n > -1, `option ${option} should be non negative`);
    return n;
}

function getPackages({ onlyChanged = false } = {}) {
    const args = [
        // <- prevent format in one line
        `--recursive`,
        `--json`,
        `--depth -1`,
        `--filter !web-widgets`,
        onlyChanged ? '--filter "...[origin/main]"' : ""
    ].filter(v => !!v);
    const command = [`pnpm ls`, ...args].join(" ");

    const listing = execSync(command, { encoding: "utf-8" });
    return JSON.parse(listing === "" ? "[]" : listing);
}

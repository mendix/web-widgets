#!/usr/bin/env node
/**
 * run-e2e-in-chunks.mjs
 *
 * Splits widget packages across N parallel CI runners using weighted bin-packing
 * so every runner gets a similar total test burden.
 *
 * Algorithm: greedy first-fit-decreasing (FFD):
 *   1. Weight each package by the number of e2e *.spec.{js,ts,cjs,mjs} files.
 *   2. Sort heaviest-first.
 *   3. Assign each package to the bin with the lowest current weight.
 *
 * --print-matrix: instead of running tests, prints the GitHub Actions matrix JSON
 *   to stdout and exits. Used by the e2e-plan CI job to build a dynamic matrix
 *   sized to the number of packages in scope (PR: changed only; push: all).
 *
 * Playwright sharding: pass --use-playwright-shard to enable Playwright's
 * native --shard flag within each per-widget run. Requires Playwright ≥ 1.31.
 */

import c from "ansi-colors";
import { execSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import parseArgs from "yargs-parser";
import assert from "node:assert/strict";

const MAX_CHUNKS = 8;

function main() {
    const parseArgsOptions = {
        number: ["index", "chunks"],
        string: ["event-name"],
        boolean: ["use-playwright-shard", "debug-chunks", "print-matrix"],
        coerce: {},
        default: {
            chunks: MAX_CHUNKS,
            "event-name": "push",
            "use-playwright-shard": false,
            "debug-chunks": false,
            "print-matrix": false
        }
    };

    const options = parseArgs(process.argv.slice(2), parseArgsOptions);
    const eventName = options.eventName;

    // --print-matrix: output the GitHub Actions matrix JSON and exit.
    // Called by the e2e-plan CI job to size the matrix to packages in scope.
    if (options.printMatrix) {
        const packages = getPackages({ onlyChanged: eventName === "pull_request" });
        const needed = Math.min(Math.max(packages.length, 1), MAX_CHUNKS);
        const matrix = {
            index: Array.from({ length: needed }, (_, i) => i),
            include: [{ chunks: needed }]
        };
        process.stdout.write(JSON.stringify(matrix) + "\n");
        return;
    }

    const index = validateParam(options.index, "index");
    const chunks = validateParam(options.chunks, "chunks");

    if (index < 0 || index >= chunks) {
        const message = `Out of range. Received: index - ${index}, chunks - ${chunks}`;
        throw new Error(message);
    }

    const packages = getPackages({ onlyChanged: eventName === "pull_request" });

    // -------------------------------------------------------------------------
    // Weighted bin-packing (FFD)
    // -------------------------------------------------------------------------
    const weighted = packages.map(pkg => ({
        ...pkg,
        weight: getE2eSpecFileCount(pkg)
    }));

    // Sort heaviest first so large packages aren't left to overflow a single bin
    const sorted = [...weighted].sort((a, b) => b.weight - a.weight);

    // Initialise chunk bins
    const bins = Array.from({ length: chunks }, () => ({ totalWeight: 0, packages: [] }));

    for (const pkg of sorted) {
        // Greedy: assign to the bin with the lowest current weight
        const targetBin = bins.reduce((min, bin) => (bin.totalWeight < min.totalWeight ? bin : min), bins[0]);
        targetBin.packages.push(pkg);
        targetBin.totalWeight += pkg.weight;
    }

    if (options.debugChunks) {
        printChunkDebugTable(bins);
    }

    const myPackages = bins[index].packages;

    if (myPackages.length === 0) {
        console.log(c.yellow(`Chunk ${index}: no packages assigned, skipping.`));
        printChunkSummary(bins, index);
        return;
    }

    printChunkSummary(bins, index);

    const filters = myPackages.map(pkg => `--filter=${pkg.name}`);

    const command = [`pnpm`, `--workspace-root`, `exec`, `turbo run e2e`, `--concurrency=1`, ...filters].join(" ");

    execSync(command, { stdio: "inherit" });
}

// ---------------------------------------------------------------------------
// Weight measurement: count *.spec.{js,ts,cjs,mjs} files in the e2e/ dir.
// Returns 1 as a minimum so every package has a non-zero weight.
// ---------------------------------------------------------------------------
function getE2eSpecFileCount(pkg) {
    try {
        const e2eDir = join(pkg.path, "e2e");
        if (!existsSync(e2eDir)) return 1;
        const specFiles = readdirSync(e2eDir, { recursive: true }).filter(f => /\.spec\.(js|ts|cjs|mjs)$/.test(f));
        return Math.max(specFiles.length, 1);
    } catch {
        // If the path is unavailable (e.g. in CI before checkout), fall back to 1
        return 1;
    }
}

// ---------------------------------------------------------------------------
// Logging helpers
// ---------------------------------------------------------------------------
function printChunkSummary(bins, currentIndex) {
    const myBin = bins[currentIndex];
    console.log(
        c.cyan(`Chunk ${currentIndex}/${bins.length - 1}`) +
            c.gray(` | weight ${myBin.totalWeight} | ${myBin.packages.length} package(s)`)
    );
    for (const pkg of myBin.packages) {
        console.log(`  ${c.white(pkg.name)} ${c.gray(`(${pkg.weight} spec files)`)}`);
    }
}

function printChunkDebugTable(bins) {
    console.log(c.bold("\n=== Chunk distribution (debug) ==="));
    for (const [i, bin] of bins.entries()) {
        const names = bin.packages.map(p => `${p.name}(${p.weight})`).join(", ");
        console.log(`  Chunk ${i} [total=${bin.totalWeight}]: ${names || "(empty)"}`);
    }
    const weights = bins.map(b => b.totalWeight);
    const max = Math.max(...weights);
    const min = Math.min(...weights);
    console.log(c.gray(`  imbalance: max=${max} min=${min} ratio=${(max / Math.max(min, 1)).toFixed(2)}x\n`));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
main();

function validateParam(value, option) {
    const n = parseInt(value, 10);
    assert.notStrictEqual(n, NaN, `option ${option} should be integer`);
    assert.ok(n > -1, `option ${option} should be non negative`);
    return n;
}

function getPackages({ onlyChanged = false } = {}) {
    const args = [
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

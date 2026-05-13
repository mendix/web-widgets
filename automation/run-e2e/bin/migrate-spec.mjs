#!/usr/bin/env node

/**
 * Migrates E2E spec files to use shared fixtures and helpers.
 *
 * Usage: node migrate-spec.mjs <spec-file-path> [--dry-run]
 *
 * Transforms:
 * 1. Replaces `import { test, expect } from "@playwright/test"` with shared fixtures
 * 2. Removes afterEach logout blocks (fixture handles session cleanup)
 * 3. Replaces `waitForLoadState("networkidle")` with `waitForMendixApp(page)`
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const filePath = args.find(a => !a.startsWith("--"));

if (!filePath) {
    console.error("Usage: migrate-spec.mjs <spec-file-path> [--dry-run]");
    process.exit(1);
}

const absPath = resolve(filePath);
let content = readFileSync(absPath, "utf-8");
const original = content;
const changes = [];

// 1. Replace import from @playwright/test with shared fixtures (handles both orderings)
const importPattern =
    /import\s*\{\s*(?:test\s*,\s*expect|expect\s*,\s*test)\s*\}\s*from\s*["']@playwright\/test["'];?/g;
if (importPattern.test(content)) {
    content = content.replace(importPattern, 'import { expect, test } from "@mendix/run-e2e/fixtures";');
    changes.push("Replaced @playwright/test import with shared fixtures");
}

// 2. Remove afterEach logout block (multiple patterns observed)
const afterEachPattern =
    /\s*test\.afterEach\s*\(\s*["']Cleanup session["']\s*,\s*async\s*\(\s*\{\s*page\s*\}\s*\)\s*=>\s*\{[^}]*(?:window\.mx\.session\.logout|window\.mx\?\.session\?\.logout)[^}]*\}\s*\)\s*;?\n?/g;
if (afterEachPattern.test(content)) {
    content = content.replace(afterEachPattern, "\n");
    changes.push("Removed afterEach session logout block (fixture handles this)");
}

// 3. Replace waitForLoadState("networkidle") with waitForMendixApp
const networkIdlePattern = /await\s+page\.waitForLoadState\s*\(\s*["']networkidle["']\s*\)\s*;?/g;
if (networkIdlePattern.test(content)) {
    // Add helper import if not already present
    if (!content.includes("@mendix/run-e2e/mendix-helpers")) {
        const insertAfterImport = content.indexOf("\n", content.indexOf("import"));
        if (insertAfterImport !== -1) {
            content =
                content.slice(0, insertAfterImport + 1) +
                'import { waitForMendixApp } from "@mendix/run-e2e/mendix-helpers";\n' +
                content.slice(insertAfterImport + 1);
        }
    }
    content = content.replace(networkIdlePattern, "await waitForMendixApp(page);");
    changes.push("Replaced waitForLoadState('networkidle') with waitForMendixApp(page)");
}

if (content === original) {
    console.log(`No changes needed: ${absPath}`);
    process.exit(0);
}

if (dryRun) {
    console.log(`[DRY RUN] Would apply to: ${absPath}`);
    changes.forEach(c => console.log(`  - ${c}`));
} else {
    writeFileSync(absPath, content, "utf-8");
    console.log(`Migrated: ${absPath}`);
    changes.forEach(c => console.log(`  - ${c}`));
}

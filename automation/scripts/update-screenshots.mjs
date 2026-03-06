#!/usr/bin/env node
/**
 * update-screenshots.mjs
 *
 * Downloads failed Playwright screenshot baselines from a GitHub Actions run
 * and overwrites the local snapshot files (using the chromium-linux prefix).
 *
 * Usage:
 *   node automation/scripts/update-screenshots.mjs <summary-url> [options]
 *
 * Examples:
 *   node automation/scripts/update-screenshots.mjs \
 *     "https://github.com/mendix/web-widgets/actions/runs/22576155684?pr=2034"
 *
 *   node automation/scripts/update-screenshots.mjs \
 *     "https://github.com/mendix/web-widgets/actions/runs/22576155684?pr=2034" \
 *     --dry-run --token ghp_xxxxxxxxxxxx
 */

import https from "node:https";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { execSync, spawnSync } from "node:child_process";
import { pipeline } from "node:stream/promises";
import { parseArgs } from "node:util";
import { createWriteStream } from "node:fs";

// ─── ANSI colours & formatting ────────────────────────────────────────────────

const BOLD = s => `\x1b[1m${s}\x1b[0m`;
const DIM = s => `\x1b[2m${s}\x1b[0m`;
const CYAN = s => `\x1b[36m${s}\x1b[0m`;
const GREEN = s => `\x1b[32m${s}\x1b[0m`;
const YELLOW = s => `\x1b[33m${s}\x1b[0m`;
const RED = s => `\x1b[31m${s}\x1b[0m`;
const MAGENTA = s => `\x1b[35m${s}\x1b[0m`;
const RESET = "\x1b[0m";

const isTTY = process.stdout.isTTY;

function box(lines, color = CYAN) {
    const maxLen = Math.max(...lines.map(l => stripAnsi(l).length));
    const width = maxLen + 4;
    const top = color("╔" + "═".repeat(width) + "╗");
    const bot = color("╚" + "═".repeat(width) + "╝");
    const mid = lines.map(l => {
        const pad = width - stripAnsi(l).length;
        return color("║") + "  " + l + " ".repeat(pad - 2) + color("║");
    });
    return [top, ...mid, bot].join("\n");
}

function stripAnsi(str) {
    // eslint-disable-next-line no-control-regex
    return str.replace(/\x1b\[[0-9;]*m/g, "");
}

function divider(width = 64) {
    return DIM("─".repeat(width));
}

// ─── Spinner ─────────────────────────────────────────────────────────────────

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

class Spinner {
    constructor(label) {
        this.label = label;
        this.frame = 0;
        this.interval = null;
    }

    start() {
        if (!isTTY) {
            process.stdout.write(`  ${this.label}...\n`);
            return this;
        }
        process.stdout.write("\n");
        this.interval = setInterval(() => {
            const f = CYAN(FRAMES[this.frame++ % FRAMES.length]);
            process.stdout.write(`\r  ${f} ${this.label}   `);
        }, 80);
        return this;
    }

    succeed(msg) {
        this._stop();
        process.stdout.write(`\r  ${GREEN("✔")} ${msg || this.label}\n`);
    }

    fail(msg) {
        this._stop();
        process.stdout.write(`\r  ${RED("✖")} ${msg || this.label}\n`);
    }

    update(label) {
        this.label = label;
    }

    _stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}

// ─── Help & usage ─────────────────────────────────────────────────────────────

const USAGE = `
${box(
    [BOLD("📸  Playwright Screenshot Baseline Updater"), DIM("Mendix Web Widgets  ·  CI → Local baseline sync")],
    CYAN
)}

${BOLD("USAGE")}
  ${CYAN("node automation/scripts/update-screenshots.mjs")} ${YELLOW("<summary-url>")} ${DIM("[options]")}

${BOLD("ARGUMENTS")}
  ${YELLOW("<summary-url>")}   GitHub Actions run summary URL (required)
                   ${DIM("e.g. https://github.com/mendix/web-widgets/actions/runs/22576155684?pr=2034")}

${BOLD("OPTIONS")}
  ${GREEN("-t, --token")}      GitHub personal access token (or set ${CYAN("GITHUB_TOKEN")} env var)
                   Required for private repositories and artifact downloads
  ${GREEN("-a, --artifact")}   Artifact name pattern to download ${DIM("[default: test-screenshot-results]")}
  ${GREEN("-p, --prefix")}     Platform prefix for snapshot files  ${DIM("[default: chromium-linux]")}
  ${GREEN("-n, --dry-run")}    Preview which files would be updated without overwriting
  ${GREEN("-v, --verbose")}    Print extra diagnostic information
  ${GREEN("-h, --help")}       Show this help message

${BOLD("EXAMPLES")}
  ${DIM("# Basic usage — token from GITHUB_TOKEN env var")}
  ${CYAN("node automation/scripts/update-screenshots.mjs")} \\
    ${YELLOW('"https://github.com/mendix/web-widgets/actions/runs/22576155684?pr=2034"')}

  ${DIM("# Explicit token + dry-run preview")}
  ${CYAN("node automation/scripts/update-screenshots.mjs")} \\
    ${YELLOW('"https://github.com/mendix/web-widgets/actions/runs/22576155684"')} \\
    ${GREEN("--token")} ghp_xxxxxxxxxxxx ${GREEN("--dry-run")}

  ${DIM("# Custom artifact name + prefix")}
  ${CYAN("node automation/scripts/update-screenshots.mjs")} \\
    ${YELLOW('"https://github.com/mendix/web-widgets/actions/runs/22576155684"')} \\
    ${GREEN("--artifact")} test-screenshot-results ${GREEN("--prefix")} firefox-linux
`;

// ─── Argument parsing ─────────────────────────────────────────────────────────

const { values: opts, positionals } = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
    options: {
        token: { type: "string", short: "t" },
        artifact: { type: "string", short: "a", default: "test-screenshot-results" },
        prefix: { type: "string", short: "p", default: "chromium-linux" },
        "dry-run": { type: "boolean", short: "n", default: false },
        verbose: { type: "boolean", short: "v", default: false },
        help: { type: "boolean", short: "h", default: false }
    }
});

if (opts.help || positionals.length === 0) {
    console.log(USAGE);
    process.exit(opts.help ? 0 : 1);
}

const SUMMARY_URL = positionals[0];
const GH_TOKEN = opts.token || process.env.GITHUB_TOKEN || "";
const ARTIFACT_PATTERN = opts.artifact;
const SNAPSHOT_PREFIX = opts.prefix;
const DRY_RUN = opts["dry-run"];
const VERBOSE = opts.verbose;

// ─── URL parser ──────────────────────────────────────────────────────────────

function parseGitHubRunUrl(url) {
    // Accepts:
    //   https://github.com/{owner}/{repo}/actions/runs/{runId}
    //   https://github.com/{owner}/{repo}/actions/runs/{runId}?pr=XXX
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/actions\/runs\/(\d+)/);
    if (!match) {
        bail(
            `Cannot parse GitHub Actions run URL:\n  ${url}\n\n  Expected format: https://github.com/{owner}/{repo}/actions/runs/{runId}`
        );
    }
    const [, owner, repo, runId] = match;
    return { owner, repo, runId };
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

function buildHeaders(extra = {}) {
    const h = {
        "User-Agent": "update-screenshots-cli/1.0",
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...extra
    };
    if (GH_TOKEN) h["Authorization"] = `Bearer ${GH_TOKEN}`;
    return h;
}

async function httpGetJson(url) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url);
        const options = {
            hostname: parsed.hostname,
            path: parsed.pathname + parsed.search,
            headers: buildHeaders()
        };
        const req = https.get(options, res => {
            let body = "";
            res.on("data", chunk => (body += chunk));
            res.on("end", () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(body));
                    } catch (e) {
                        reject(new Error(`JSON parse error: ${e.message}\nBody: ${body.slice(0, 200)}`));
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${body.slice(0, 300)}`));
                }
            });
        });
        req.on("error", reject);
    });
}

async function downloadToFile(url, destPath, redirectsLeft = 5) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url);
        const isGitHubApi = parsed.hostname === "api.github.com";
        // For GitHub API artifact endpoints, use standard API headers.
        // For redirect targets (e.g. signed S3 URLs), send no auth headers.
        const options = {
            hostname: parsed.hostname,
            path: parsed.pathname + parsed.search,
            headers: isGitHubApi ? buildHeaders() : { "User-Agent": "update-screenshots-cli/1.0" }
        };
        const req = https.get(options, res => {
            if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
                if (redirectsLeft <= 0) {
                    reject(new Error("Too many redirects"));
                    return;
                }
                res.resume();
                downloadToFile(res.headers.location, destPath, redirectsLeft - 1)
                    .then(resolve)
                    .catch(reject);
                return;
            }
            if (res.statusCode < 200 || res.statusCode >= 300) {
                reject(new Error(`HTTP ${res.statusCode} while downloading artifact`));
                return;
            }
            const ws = createWriteStream(destPath);
            pipeline(res, ws).then(resolve).catch(reject);
        });
        req.on("error", reject);
    });
}

// ─── ZIP extraction ───────────────────────────────────────────────────────────

function extractZip(zipPath, destDir) {
    // Prefer unzip (macOS/Linux)
    const unzip = spawnSync("unzip", ["-o", zipPath, "-d", destDir], {
        stdio: VERBOSE ? "inherit" : "pipe"
    });
    if (unzip.status === 0) return;

    // Fallback: python3 zipfile module
    const py = spawnSync(
        "python3",
        ["-c", `import zipfile, sys; zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])`, zipPath, destDir],
        { stdio: VERBOSE ? "inherit" : "pipe" }
    );
    if (py.status === 0) return;

    throw new Error("Could not extract ZIP.\n  Install `unzip` (brew install unzip) or ensure Python 3 is available.");
}

// ─── Snapshot path resolution ─────────────────────────────────────────────────

/**
 * Finds all candidate package directories from the extracted ZIP path parts.
 * Handles multiple ZIP structures:
 *   A) Full CI path:   home/runner/work/.../packages/pluggableWidgets/gallery-web/test-results/...
 *   B) Repo-relative: packages/pluggableWidgets/gallery-web/test-results/...
 *   C) Stripped:      pluggableWidgets/gallery-web/test-results/...  (v4 artifact strips packages/)
 *   D) Via node_modules: .../node_modules/@mendix/gallery-web/test-results/...
 */
const CATEGORY_DIRS = new Set(["pluggableWidgets", "modules", "customWidgets", "shared"]);

function extractCandidatePackageDirs(parts, testResultsIdx, repoRoot) {
    const candidates = [];

    // Walk from right to left looking for a known category dir.
    // Each package in this monorepo is exactly: packages/<category>/<name>
    // so take only 2 path components after "packages/".
    for (let i = testResultsIdx - 1; i >= 0; i--) {
        if (CATEGORY_DIRS.has(parts[i]) && i + 1 < testResultsIdx) {
            // e.g. parts[i] = 'pluggableWidgets', parts[i+1] = 'gallery-web'
            const relPath = path.join("packages", parts[i], parts[i + 1]);
            const absPath = path.join(repoRoot, relPath);
            if (fs.existsSync(absPath) && !candidates.includes(absPath)) {
                candidates.push(absPath);
            }
            // Keep scanning so we collect all valid matches (edge case: same category
            // appears multiple times in a node_modules path — we want the real package)
        }
    }

    return candidates;
}

/**
 * Given:
 *   extractedRoot / [optional-ci-prefix/] [packages/] pluggableWidgets/gallery-web/test-results/.../galleryContent-actual.png
 *
 * We want:
 *   <repoRoot>/packages/pluggableWidgets/gallery-web/e2e/Gallery.spec.js-snapshots/galleryContent-chromium-linux.png
 */
function resolveTargetSnapshot(actualFilePath, extractedRoot, repoRoot, prefix) {
    const rel = path.relative(extractedRoot, actualFilePath);
    const parts = rel.split(path.sep);
    const testResultsIdx = parts.findIndex(p => p === "test-results");
    if (testResultsIdx < 0) return null;

    const fileName = path.basename(actualFilePath);
    const snapshotBase = fileName.replace(/-actual\.png$/, "");
    const targetFileName = `${snapshotBase}-${prefix}.png`;

    const candidatePkgDirs = extractCandidatePackageDirs(parts, testResultsIdx, repoRoot);

    // Try to find the existing snapshot in each candidate package
    for (const pkgDir of candidatePkgDirs) {
        const snapshotsDir = path.join(pkgDir, "e2e");
        // Skip packages that have no e2e directory — they're a dependent module, not the owner
        if (!fs.existsSync(snapshotsDir)) continue;
        const found = findFileInDir(snapshotsDir, targetFileName);
        if (found) {
            const packageRelDir = path.relative(repoRoot, pkgDir);
            return { targetPath: found, packageRelDir, snapshotBase, targetFileName, isNew: false };
        }
    }

    // File doesn't exist yet (new snapshot) — use the first valid candidate with an e2e dir
    for (const pkgDir of candidatePkgDirs) {
        const snapshotsDir = path.join(pkgDir, "e2e");
        if (!fs.existsSync(snapshotsDir)) continue;
        const fallbackDir = findFirstSnapshotDir(snapshotsDir);
        if (fallbackDir) {
            const packageRelDir = path.relative(repoRoot, pkgDir);
            return {
                targetPath: path.join(fallbackDir, targetFileName),
                packageRelDir,
                snapshotBase,
                targetFileName,
                isNew: true
            };
        }
    }

    // Last resort — infer spec file from snapshot base name
    if (candidatePkgDirs.length > 0) {
        // Only use packages that have an established e2e directory
        const pkgDir = candidatePkgDirs.find(d => fs.existsSync(path.join(d, "e2e")));
        if (pkgDir) {
            const packageRelDir = path.relative(repoRoot, pkgDir);
            const guessedDir = path.join(pkgDir, "e2e", `${snapshotBase}.spec.js-snapshots`);
            return {
                targetPath: path.join(guessedDir, targetFileName),
                packageRelDir,
                snapshotBase,
                targetFileName,
                isNew: true
            };
        }
    }

    return null;
}

const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build"]);

function findFileInDir(dir, filename) {
    if (!fs.existsSync(dir)) return null;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (SKIP_DIRS.has(entry.name)) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.isSymbolicLink()) {
            const found = findFileInDir(full, filename);
            if (found) return found;
        } else if (entry.name === filename) {
            return full;
        }
    }
    return null;
}

function findFirstSnapshotDir(dir) {
    if (!fs.existsSync(dir)) return null;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    // Prefer *-snapshots dirs at the top level first
    for (const entry of entries) {
        if (SKIP_DIRS.has(entry.name)) continue;
        if (entry.isDirectory() && entry.name.endsWith("-snapshots")) {
            return path.join(dir, entry.name);
        }
    }
    // Then recurse into non-snapshots subdirs
    for (const entry of entries) {
        if (SKIP_DIRS.has(entry.name)) continue;
        if (entry.isDirectory() && !entry.isSymbolicLink()) {
            const nested = findFirstSnapshotDir(path.join(dir, entry.name));
            if (nested) return nested;
        }
    }
    return null;
}

function findAllActualPngs(dir) {
    const results = [];
    if (!fs.existsSync(dir)) return results;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results.push(...findAllActualPngs(full));
        } else if (entry.name.endsWith("-actual.png")) {
            results.push(full);
        }
    }
    return results;
}

// ─── Error helper ─────────────────────────────────────────────────────────────

function bail(msg) {
    console.error(`\n  ${RED("✖ Error:")} ${msg}\n`);
    process.exit(1);
}

function log(msg) {
    if (VERBOSE) console.log(DIM(`    ${msg}`));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    // ── Header ───────────────────────────────────────────────────────────────
    console.log(
        "\n" +
            box(
                [
                    BOLD("📸  Screenshot Baseline Updater"),
                    DIM("Mendix Web Widgets  ·  CI artifact → local baseline sync")
                ],
                CYAN
            ) +
            "\n"
    );

    if (DRY_RUN) {
        console.log(`  ${YELLOW("◆ DRY RUN")} ${DIM("— no files will be written\n")}`);
    }

    // ── Parse URL ────────────────────────────────────────────────────────────
    const { owner, repo, runId } = parseGitHubRunUrl(SUMMARY_URL);

    console.log(`  ${DIM("Repository  ")} ${CYAN(`${owner}/${repo}`)}`);
    console.log(`  ${DIM("Run ID      ")} ${CYAN(runId)}`);
    console.log(`  ${DIM("Artifact    ")} ${CYAN(ARTIFACT_PATTERN + "*")}`);
    console.log(`  ${DIM("Prefix      ")} ${CYAN(SNAPSHOT_PREFIX)}`);
    if (!GH_TOKEN) {
        console.log(
            `\n  ${YELLOW("⚠")}  No GitHub token provided. Set ${CYAN("GITHUB_TOKEN")} or use ${GREEN("--token")}.\n`
        );
    }
    console.log("\n" + divider());

    // ── Fetch artifacts list ─────────────────────────────────────────────────
    const spinner1 = new Spinner("Fetching artifacts list from GitHub API").start();
    let artifacts;
    try {
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}/artifacts?per_page=100`;
        log(`GET ${apiUrl}`);
        const data = await httpGetJson(apiUrl);
        artifacts = (data.artifacts || []).filter(a => a.name.startsWith(ARTIFACT_PATTERN));
        spinner1.succeed(
            `Found ${GREEN(String(artifacts.length))} artifact(s) matching ${YELLOW(ARTIFACT_PATTERN + "*")}`
        );
    } catch (err) {
        spinner1.fail(`Failed to fetch artifacts: ${err.message}`);
        bail(
            err.message.includes("401") || err.message.includes("403")
                ? "Authentication failed. Provide a valid GitHub token via --token or GITHUB_TOKEN."
                : err.message
        );
    }

    if (artifacts.length === 0) {
        bail(
            `No artifacts found matching "${ARTIFACT_PATTERN}*" for run ${runId}.\n` +
                `  Run may not have produced screenshot artifacts, or the pattern is wrong.`
        );
    }

    // ── Temp dir ─────────────────────────────────────────────────────────────
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "mxw-screenshots-"));
    log(`Temp dir: ${tmpDir}`);

    const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
    log(`Repo root: ${repoRoot}`);

    // ── Download & extract artifacts ─────────────────────────────────────────
    console.log();
    const extractedDirs = [];

    for (const artifact of artifacts) {
        const spinner = new Spinner(
            `Downloading ${BOLD(artifact.name)} (${formatBytes(artifact.size_in_bytes)})`
        ).start();
        const zipPath = path.join(tmpDir, `${artifact.name}.zip`);
        const extractDir = path.join(tmpDir, artifact.name);

        try {
            const downloadUrl = `https://api.github.com/repos/${owner}/${repo}/actions/artifacts/${artifact.id}/zip`;
            log(`Downloading ${downloadUrl} → ${zipPath}`);
            await downloadToFile(downloadUrl, zipPath);

            spinner.update(`Extracting ${BOLD(artifact.name)}`);
            fs.mkdirSync(extractDir, { recursive: true });
            extractZip(zipPath, extractDir);
            fs.rmSync(zipPath, { force: true });

            const pngs = findAllActualPngs(extractDir);
            spinner.succeed(`${BOLD(artifact.name)} → ${GREEN(String(pngs.length))} actual screenshot(s) found`);
            extractedDirs.push({ dir: extractDir, pngCount: pngs.length });
        } catch (err) {
            spinner.fail(`Failed: ${err.message}`);
            if (VERBOSE) console.error(err);
        }
    }

    // ── Resolve & copy screenshots ────────────────────────────────────────────
    console.log("\n" + divider());
    console.log(`\n  ${BOLD("Mapping actual screenshots → baselines")}\n`);

    const updated = [];
    const skipped = [];
    const errors = [];
    // Deduplicate: same target path may appear from multiple shards/retries
    const writtenTargets = new Set();

    for (const { dir } of extractedDirs) {
        const actuals = findAllActualPngs(dir);

        for (const actualPath of actuals) {
            const resolved = resolveTargetSnapshot(actualPath, dir, repoRoot, SNAPSHOT_PREFIX);

            if (!resolved) {
                skipped.push({ actualPath, reason: "No matching package with e2e dir found" });
                log(`  ${path.relative(dir, actualPath)} — skipped (no matching package with e2e dir)`);
                continue;
            }

            const { targetPath, packageRelDir, snapshotBase, targetFileName, isNew } = resolved;

            // Deduplicate: skip if this target was already written (multiple shards/retries)
            if (writtenTargets.has(targetPath)) {
                log(`  Skipping duplicate: ${path.relative(repoRoot, targetPath)}`);
                continue;
            }
            const displayTarget = path.relative(repoRoot, targetPath);
            const displayActual = path.relative(dir, actualPath);

            log(`  ${displayActual} → ${displayTarget}`);

            if (DRY_RUN) {
                const badge = isNew ? YELLOW("NEW") : CYAN("UPDATE");
                console.log(`  ${badge}  ${BOLD(snapshotBase)}  ${DIM("→")}  ${CYAN(displayTarget)}`);
                writtenTargets.add(targetPath);
                updated.push({ targetPath, actualPath, snapshotBase, isNew, packageRelDir });
                continue;
            }

            try {
                fs.mkdirSync(path.dirname(targetPath), { recursive: true });
                fs.copyFileSync(actualPath, targetPath);
                const badge = isNew ? YELLOW("+ new") : GREEN("✔ updated");
                console.log(`  ${badge}  ${BOLD(snapshotBase)}  ${DIM("→")}  ${CYAN(displayTarget)}`);
                writtenTargets.add(targetPath);
                updated.push({ targetPath, actualPath, snapshotBase, isNew, packageRelDir });
            } catch (err) {
                errors.push({ actualPath, targetPath, error: err.message });
                console.log(`  ${RED("✖ error")}  ${snapshotBase}  — ${err.message}`);
            }
        }
    }

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log("\n" + divider());

    // Group by package
    const byPackage = {};
    for (const { packageRelDir, snapshotBase, isNew } of updated) {
        const pkg = packageRelDir || "unknown";
        if (!byPackage[pkg]) byPackage[pkg] = [];
        byPackage[pkg].push({ snapshotBase, isNew });
    }

    const totalUpdated = updated.filter(u => !u.isNew).length;
    const totalNew = updated.filter(u => u.isNew).length;
    const totalErrors = errors.length;
    const totalSkipped = skipped.length;

    const summaryLines = [BOLD("📊  Summary"), ""];

    if (updated.length === 0 && errors.length === 0) {
        summaryLines.push(`  ${YELLOW("No screenshots were updated.")}`);
        summaryLines.push(`  ${DIM("All actual screenshots matched their baselines, or no actuals were found.")}`);
    } else {
        for (const [pkg, snapshots] of Object.entries(byPackage)) {
            summaryLines.push(`  ${MAGENTA(pkg)}`);
            for (const { snapshotBase, isNew } of snapshots) {
                const badge = isNew ? YELLOW("+ new     ") : GREEN("✔ updated ");
                summaryLines.push(`    ${badge} ${snapshotBase}-${SNAPSHOT_PREFIX}.png`);
            }
            summaryLines.push("");
        }
    }

    if (totalErrors > 0) {
        summaryLines.push(`  ${RED("Errors:")} ${totalErrors}`);
        for (const { snapshotBase, error } of errors) {
            summaryLines.push(`    ${RED("✖")} ${snapshotBase}: ${error}`);
        }
        summaryLines.push("");
    }

    summaryLines.push(divider(54));
    const parts = [];
    if (totalUpdated > 0) parts.push(GREEN(`${totalUpdated} updated`));
    if (totalNew > 0) parts.push(YELLOW(`${totalNew} new`));
    if (totalErrors > 0) parts.push(RED(`${totalErrors} error(s)`));
    if (totalSkipped > 0) parts.push(DIM(`${totalSkipped} skipped`));
    summaryLines.push(`  ${parts.join("  ·  ") || DIM("nothing changed")}`);

    if (DRY_RUN) {
        summaryLines.push("");
        summaryLines.push(`  ${YELLOW("Dry-run mode")} — ${DIM("run without --dry-run to apply changes")}`);
    }

    console.log("\n" + box(summaryLines, totalErrors > 0 ? RED : GREEN) + "\n");

    // ── Cleanup ───────────────────────────────────────────────────────────────
    try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
        log(`Cleaned up temp dir: ${tmpDir}`);
    } catch {
        // non-fatal
    }

    if (totalErrors > 0) process.exit(1);
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Run ──────────────────────────────────────────────────────────────────────

main().catch(err => {
    console.error(`\n  ${RED("✖ Unexpected error:")} ${err.message}\n`);
    if (VERBOSE) console.error(err);
    process.exit(1);
});

#!/usr/bin/env node
/**
 * update-screenshots-local.mjs
 *
 * Updates Playwright screenshot baselines for a widget by running the
 * Playwright tests locally inside Docker + a Mendix runtime container.
 *
 * Usage:
 *   node automation/scripts/update-screenshots-local.mjs <command> [options]
 *
 * Commands:
 *   list                     List all widgets that have e2e tests
 *   update <widget-name>     Update screenshots for a specific widget
 *   versions                 List available Mendix runtime versions
 *
 * Examples:
 *   node automation/scripts/update-screenshots-local.mjs update gallery-web
 *   node automation/scripts/update-screenshots-local.mjs update calendar-web --mendix-version 10.24.0.73019
 *   node automation/scripts/update-screenshots-local.mjs update datagrid-web --skip-atlas --token ghp_xxx
 */

import https from "node:https";
import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { exec, execSync, spawn, spawnSync } from "node:child_process";
import { pipeline } from "node:stream/promises";
import { parseArgs, promisify } from "node:util";
import { createWriteStream } from "node:fs";
import { fileURLToPath } from "node:url";

const execAsync = promisify(exec);

// ─── ANSI colours & formatting ──────────────────────────────────────────────

const BOLD = s => `\x1b[1m${s}\x1b[0m`;
const DIM = s => `\x1b[2m${s}\x1b[0m`;
const CYAN = s => `\x1b[36m${s}\x1b[0m`;
const GREEN = s => `\x1b[32m${s}\x1b[0m`;
const YELLOW = s => `\x1b[33m${s}\x1b[0m`;
const RED = s => `\x1b[31m${s}\x1b[0m`;
const MAGENTA = s => `\x1b[35m${s}\x1b[0m`;
const BLUE = s => `\x1b[34m${s}\x1b[0m`;

const isTTY = process.stdout.isTTY;

function stripAnsi(str) {
    // eslint-disable-next-line no-control-regex
    return str.replace(/\x1b\[[0-9;]*m/g, "");
}

function box(lines, color = CYAN) {
    const maxLen = Math.max(...lines.map(l => stripAnsi(l).length));
    const width = maxLen + 4;
    const top = color("╔" + "═".repeat(width) + "╗");
    const bot = color("╚" + "═".repeat(width) + "╝");
    const mid = lines.map(l => {
        const pad = width - stripAnsi(l).length;
        return color("║") + " " + l + " ".repeat(pad - 2) + color("║");
    });
    return [top, ...mid, bot].join("\n");
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
            process.stdout.write(` ${this.label}...\n`);
            return this;
        }
        process.stdout.write("\n");
        this.interval = setInterval(() => {
            const f = CYAN(FRAMES[this.frame++ % FRAMES.length]);
            process.stdout.write(`\r ${f} ${this.label} `);
        }, 80);
        return this;
    }

    succeed(msg) {
        this._stop();
        process.stdout.write(`\r ${GREEN("✔")} ${msg || this.label}\n`);
    }

    fail(msg) {
        this._stop();
        process.stdout.write(`\r ${RED("✖")} ${msg || this.label}\n`);
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

// ─── Help & usage ────────────────────────────────────────────────────────────

const USAGE = `
${box([BOLD("🖼  Playwright Screenshot Updater (local)"), DIM("Mendix Web Widgets · Docker + Mendix runtime")], CYAN)}

${BOLD("USAGE")}
  ${CYAN("node automation/scripts/update-screenshots-local.mjs")} ${YELLOW("<command>")} ${DIM("[options]")}

${BOLD("COMMANDS")}
  ${GREEN("list")}                         List all widgets that have e2e tests
  ${GREEN("update")} ${YELLOW("<widget-name>")}        Update screenshots for a specific widget
  ${GREEN("versions")}                     List available Mendix runtime versions

${BOLD("OPTIONS  (update command)")}
  ${GREEN("-t, --token")} ${DIM("<token>")}       GitHub token for Atlas downloads (or ${CYAN("GITHUB_TOKEN")} env var)
  ${GREEN("-v, --mendix-version")} ${DIM("<v>")}  Mendix version to use ${DIM("[default: latest]")}
  ${GREEN("-s, --skip-atlas")}             Skip Atlas theme / themesource updates
  ${GREEN("--verbose")}                    Print extra diagnostic information
  ${GREEN("-h, --help")}                   Show this help message

${BOLD("EXAMPLES")}
  ${DIM("# List available widgets")}
  ${CYAN("node automation/scripts/update-screenshots-local.mjs")} ${GREEN("list")}

  ${DIM("# Update using GITHUB_TOKEN env var")}
  ${CYAN("node automation/scripts/update-screenshots-local.mjs")} ${GREEN("update")} ${YELLOW("gallery-web")}

  ${DIM("# Explicit token + specific Mendix version")}
  ${CYAN("node automation/scripts/update-screenshots-local.mjs")} ${GREEN("update")} ${YELLOW("calendar-web")} \\
    ${GREEN("--token")} ghp_xxxxxxxxxxxx ${GREEN("--mendix-version")} 10.24.0.73019

  ${DIM("# Skip Atlas updates (faster, no token needed)")}
  ${CYAN("node automation/scripts/update-screenshots-local.mjs")} ${GREEN("update")} ${YELLOW("datagrid-web")} ${GREEN("--skip-atlas")}
`;

// ─── Argument parsing ────────────────────────────────────────────────────────

const { values: opts, positionals } = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
    options: {
        token: { type: "string", short: "t" },
        "mendix-version": { type: "string", short: "v" },
        "skip-atlas": { type: "boolean", short: "s", default: false },
        verbose: { type: "boolean", default: false },
        help: { type: "boolean", short: "h", default: false }
    }
});

if (opts.help || positionals.length === 0) {
    console.log(USAGE);
    process.exit(opts.help ? 0 : 1);
}

const SUBCOMMAND = positionals[0];
const GH_TOKEN = opts.token || process.env.GITHUB_TOKEN || "";
const MENDIX_VERSION_OPT = opts["mendix-version"];
const SKIP_ATLAS = opts["skip-atlas"];
const VERBOSE = opts.verbose;

// ─── Constants ───────────────────────────────────────────────────────────────

const REPO_ROOT = path.resolve(fileURLToPath(import.meta.url), "../../..");

const PATHS = {
    mendixVersions: path.join(REPO_ROOT, "automation/run-e2e/mendix-versions.json"),
    pluggableWidgets: path.join(REPO_ROOT, "packages/pluggableWidgets"),
    testsDir: path.join(REPO_ROOT, "tests"),
    testProject: path.join(REPO_ROOT, "tests/testProject"),
    dockerDir: path.join(REPO_ROOT, "automation/run-e2e/docker"),
    deployBundle: path.join(REPO_ROOT, "automation.mda")
};

const ATLAS = {
    THEME_TAG: "atlasui-theme-files-2024-01-25",
    CORE_TAG: "atlas-core-v3.18.1",
    DIRS_TO_REMOVE: [
        "themesource/atlas_ui_resources",
        "themesource/atlas_core",
        "themesource/atlas_nativemobile_content",
        "themesource/atlas_web_content",
        "themesource/datawidgets"
    ]
};

const DOCKER = {
    // noble = Ubuntu 24.04, matching GitHub Actions ubuntu-latest for identical font rendering
    PLAYWRIGHT_IMAGE: "mcr.microsoft.com/playwright:v1.56.0-noble",
    RUNTIME_HEALTH_ATTEMPTS: 60,
    RUNTIME_HEALTH_INTERVAL_MS: 3000,
    CONTAINER_ID_POLL_ATTEMPTS: 100,
    CONTAINER_ID_POLL_INTERVAL_MS: 100
};

// ─── Logging ─────────────────────────────────────────────────────────────────

function log(msg) {
    if (VERBOSE) console.log(DIM(`  ⋯ ${msg}`));
}

function info(msg) {
    console.log(`  ${CYAN("›")} ${msg}`);
}

function warn(msg) {
    console.log(`  ${YELLOW("⚠")} ${msg}`);
}

function bail(msg) {
    console.error(`\n ${RED("✖ Error:")} ${msg}\n`);
    process.exit(1);
}

// ─── HTTP helpers ────────────────────────────────────────────────────────────

function buildHeaders(extra = {}) {
    const h = {
        "User-Agent": "update-screenshots-local/1.0",
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
        const req = https.get(
            {
                hostname: parsed.hostname,
                path: parsed.pathname + parsed.search,
                headers: buildHeaders()
            },
            res => {
                let body = "";
                res.on("data", chunk => (body += chunk));
                res.on("end", () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            resolve(JSON.parse(body));
                        } catch (e) {
                            reject(new Error(`JSON parse error: ${e.message}`));
                        }
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${body.slice(0, 300)}`));
                    }
                });
            }
        );
        req.on("error", reject);
    });
}

async function downloadToFile(url, destPath, redirectsLeft = 5) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url);
        const isGitHubApi = parsed.hostname === "api.github.com";
        const options = {
            hostname: parsed.hostname,
            path: parsed.pathname + parsed.search,
            headers: isGitHubApi
                ? buildHeaders({ Accept: "application/octet-stream" })
                : { "User-Agent": "update-screenshots-local/1.0" }
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
                reject(new Error(`HTTP ${res.statusCode} while downloading`));
                return;
            }
            const ws = createWriteStream(destPath);
            pipeline(res, ws).then(resolve).catch(reject);
        });
        req.on("error", reject);
    });
}

/** Lightweight HEAD check against a local HTTP port (no extra deps). */
async function httpHeadOk(port) {
    return new Promise(resolve => {
        const req = http.request({ hostname: "localhost", port, method: "HEAD", path: "/" }, res => {
            resolve(res.statusCode >= 200 && res.statusCode < 400);
            res.resume();
        });
        req.on("error", () => resolve(false));
        req.setTimeout(2000, () => {
            req.destroy();
            resolve(false);
        });
        req.end();
    });
}

// ─── ZIP extraction ───────────────────────────────────────────────────────────

function extractZip(zipPath, destDir) {
    const unzip = spawnSync("unzip", ["-o", zipPath, "-d", destDir], {
        stdio: VERBOSE ? "inherit" : "pipe"
    });
    if (unzip.status === 0) return;

    const py = spawnSync(
        "python3",
        ["-c", `import zipfile, sys; zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])`, zipPath, destDir],
        { stdio: VERBOSE ? "inherit" : "pipe" }
    );
    if (py.status === 0) return;

    throw new Error("Could not extract ZIP.\n  Install `unzip` (brew install unzip) or ensure Python 3 is available.");
}

// ─── File-system helpers ──────────────────────────────────────────────────────

async function ensureDir(dirPath) {
    await fsp.mkdir(dirPath, { recursive: true });
}

async function removeDir(dirPath) {
    if (fs.existsSync(dirPath)) {
        await fsp.rm(dirPath, { recursive: true, force: true });
    }
}

async function copyDir(src, dest) {
    await ensureDir(dest);
    const entries = await fsp.readdir(src, { withFileTypes: true });
    await Promise.all(
        entries.map(async entry => {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            if (entry.isDirectory()) {
                await copyDir(srcPath, destPath);
            } else {
                await fsp.copyFile(srcPath, destPath);
            }
        })
    );
}

function createTempDir() {
    return fs.mkdtempSync(path.join(os.tmpdir(), "mx-screenshots-"));
}

// ─── Mendix versions ─────────────────────────────────────────────────────────

function loadMendixVersions() {
    try {
        return JSON.parse(fs.readFileSync(PATHS.mendixVersions, "utf8"));
    } catch (err) {
        bail(`Could not read Mendix versions from ${PATHS.mendixVersions}: ${err.message}`);
    }
}

// ─── Widget discovery ─────────────────────────────────────────────────────────

async function getWidgetsWithE2e() {
    if (!fs.existsSync(PATHS.pluggableWidgets)) return [];

    const entries = await fsp.readdir(PATHS.pluggableWidgets, { withFileTypes: true });
    const results = [];

    for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const e2eDir = path.join(PATHS.pluggableWidgets, entry.name, "e2e");
        if (!fs.existsSync(e2eDir)) continue;
        try {
            const files = await fsp.readdir(e2eDir);
            if (files.some(f => f.endsWith(".spec.js"))) {
                results.push(entry.name);
            }
        } catch {
            // skip unreadable dirs
        }
    }

    return results;
}

async function getWidgetPackageJson(widgetName) {
    const pkgPath = path.join(PATHS.pluggableWidgets, widgetName, "package.json");
    try {
        return JSON.parse(await fsp.readFile(pkgPath, "utf8"));
    } catch (err) {
        bail(`Could not read package.json for widget '${widgetName}': ${err.message}`);
    }
}

// ─── Docker helpers ───────────────────────────────────────────────────────────

async function isDockerRunning() {
    try {
        await execAsync("docker info --format '{{.ServerVersion}}'");
        return true;
    } catch {
        return false;
    }
}

async function findFreePort() {
    const { createServer } = await import("node:net");
    return new Promise((resolve, reject) => {
        const srv = createServer();
        srv.listen(0, "127.0.0.1", () => {
            const { port } = srv.address();
            srv.close(err => (err ? reject(err) : resolve(port)));
        });
    });
}

// ─── Atlas updater ────────────────────────────────────────────────────────────

async function fetchGitHubRelease(repo, tag) {
    const url = `https://api.github.com/repos/${repo}/releases/tags/${tag}`;
    log(`GET ${url}`);
    return httpGetJson(url);
}

async function updateAtlasTheme(testProjectDir, tmpDir) {
    const spinner = new Spinner("Updating Atlas theme").start();
    try {
        const release = await fetchGitHubRelease("mendix/atlas", ATLAS.THEME_TAG);
        const asset = release.assets.find(a => a.name.endsWith(".zip"));

        if (!asset) throw new Error("No .zip asset in Atlas theme release");

        const themeZip = path.join(tmpDir, "AtlasTheme.zip");
        await downloadToFile(asset.url, themeZip);
        extractZip(themeZip, tmpDir);
        fs.rmSync(themeZip, { force: true });

        const themeTarget = path.join(testProjectDir, "theme");
        await removeDir(themeTarget);

        const webSrc = path.join(tmpDir, "web");
        const nativeSrc = path.join(tmpDir, "native");

        if (fs.existsSync(webSrc)) await copyDir(webSrc, path.join(themeTarget, "web"));
        if (fs.existsSync(nativeSrc)) await copyDir(nativeSrc, path.join(themeTarget, "native"));

        if (!fs.existsSync(webSrc) && !fs.existsSync(nativeSrc)) {
            throw new Error("No web/native theme dirs found in Atlas theme zip");
        }

        spinner.succeed("Atlas theme updated");
    } catch (err) {
        spinner.fail(`Atlas theme update failed — ${err.message}`);
        warn("Continuing without the latest Atlas theme.");
    }
}

async function updateAtlasThemesource(testProjectDir, tmpDir) {
    const spinner = new Spinner("Updating Atlas themesource").start();
    try {
        const release = await fetchGitHubRelease("mendix/atlas", ATLAS.CORE_TAG);
        const asset = release.assets.find(a => a.name.endsWith(".mpk"));

        if (!asset) throw new Error("No .mpk asset in Atlas Core release");

        const coreMpk = path.join(tmpDir, "AtlasCore.mpk");
        await downloadToFile(asset.url, coreMpk);
        extractZip(coreMpk, tmpDir);
        fs.rmSync(coreMpk, { force: true });

        // Remove stale Atlas directories from the test project
        for (const dir of ATLAS.DIRS_TO_REMOVE) {
            await removeDir(path.join(testProjectDir, dir));
        }

        const themesourceSrc = path.join(tmpDir, "themesource");
        if (!fs.existsSync(themesourceSrc)) {
            throw new Error("themesource directory not found in Atlas Core mpk");
        }

        const themesourceDest = path.join(testProjectDir, "themesource");
        await copyDir(themesourceSrc, themesourceDest);
        spawnSync("chmod", ["-R", "+w", themesourceDest], { stdio: "pipe" });

        spinner.succeed("Atlas themesource updated");
    } catch (err) {
        spinner.fail(`Atlas themesource update failed — ${err.message}`);
        warn("Continuing without the latest Atlas themesource.");
    }
}

// ─── Test project setup ───────────────────────────────────────────────────────

async function downloadTestProject(testProject, tmpDir) {
    const url = `${testProject.githubUrl}/archive/refs/heads/${testProject.branchName}.zip`;
    const zipPath = path.join(tmpDir, "testProject.zip");
    log(`Downloading test project from ${url}`);

    const spinner = new Spinner("Downloading test project").start();
    try {
        await downloadToFile(url, zipPath);

        spinner.update("Extracting test project");
        await removeDir(PATHS.testProject);
        await ensureDir(PATHS.testsDir);
        extractZip(zipPath, PATHS.testsDir);
        fs.rmSync(zipPath, { force: true });

        const entries = await fsp.readdir(PATHS.testsDir);
        const extracted = entries.find(f => f.startsWith("testProjects-"));
        if (!extracted) throw new Error("Extracted test project directory not found");

        await fsp.rename(path.join(PATHS.testsDir, extracted), PATHS.testProject);

        // Verify .mpr file exists
        const files = await fsp.readdir(PATHS.testProject);
        if (!files.some(f => f.endsWith(".mpr"))) {
            throw new Error("No .mpr file found in test project");
        }

        spinner.succeed(`Test project ready ${DIM(`(${PATHS.testProject})`)}`);
    } catch (err) {
        spinner.fail(`Test project setup failed: ${err.message}`);
        bail(err.message);
    }
}

async function buildWidget(widgetName, widgetPkg) {
    const widgetDir = path.join(PATHS.pluggableWidgets, widgetName);
    const spinner = new Spinner(`Building widget ${BOLD(widgetName)}`).start();

    try {
        const env = { ...process.env, MX_PROJECT_PATH: PATHS.testProject };

        if (widgetPkg.scripts?.["e2e-update-project"]) {
            log(`Running e2e-update-project script for ${widgetName}`);
            execSync("pnpm run e2e-update-project", { cwd: widgetDir, env, stdio: "pipe" });
        } else {
            log(`Running release script for ${widgetPkg.name}`);
            execSync(`pnpm run --workspace-root release --filter ${widgetPkg.name}`, {
                cwd: REPO_ROOT,
                env,
                stdio: "pipe"
            });

            // Copy MPK files to test project widgets directory
            const version = widgetPkg.version || "0.0.0";
            const distDir = path.join(widgetDir, "dist", version);
            const widgetsDir = path.join(PATHS.testProject, "widgets");
            await ensureDir(widgetsDir);

            const mpkFiles = fs.readdirSync(distDir).filter(f => f.endsWith(".mpk"));
            if (mpkFiles.length === 0) {
                throw new Error(`No MPK files found in ${distDir}`);
            }
            for (const mpk of mpkFiles) {
                fs.copyFileSync(path.join(distDir, mpk), path.join(widgetsDir, mpk));
            }
        }

        spinner.succeed(`Widget ${BOLD(widgetName)} built`);
    } catch (err) {
        spinner.fail(`Widget build failed: ${err.message}`);
        bail(err.message);
    }
}

// ─── Deployment bundle ───────────────────────────────────────────────────────

async function buildDeploymentBundle(mendixVersion) {
    const mxbuildImage = `mxbuild:${mendixVersion}`;
    const spinner = new Spinner(`Building deployment bundle ${DIM(`(${mxbuildImage})`)}`).start();

    try {
        const mprFiles = fs.readdirSync(PATHS.testProject);
        const mprFile = mprFiles.find(f => f.endsWith(".mpr"));
        if (!mprFile) throw new Error("No .mpr file found in test project");

        const mprPath = `/source/tests/testProject/${mprFile}`;
        const cmd = [
            "docker run --tty --rm",
            `--volume ${REPO_ROOT}:/source`,
            mxbuildImage,
            `bash -c "mx update-widgets --loose-version-check ${mprPath} && mxbuild --output=/source/automation.mda ${mprPath}"`
        ].join(" ");

        log(`Running: ${cmd}`);
        execSync(cmd, { stdio: VERBOSE ? "inherit" : "pipe" });

        if (!fs.existsSync(PATHS.deployBundle)) {
            throw new Error("automation.mda was not created — build failed");
        }

        spinner.succeed("Deployment bundle created");
    } catch (err) {
        spinner.fail(`Deployment bundle build failed: ${err.message}`);
        bail(err.message);
    }
}

// ─── Mendix runtime ───────────────────────────────────────────────────────────

async function startMendixRuntime(mendixVersion) {
    const port = await findFreePort();
    const labelValue = Math.round(Math.random() * 900) + 100;
    const containerLabel = `e2e.mxruntime=${labelValue}`;

    const spinner = new Spinner(`Starting Mendix runtime ${DIM(`(port ${port})`)}`).start();

    const args = [
        "run",
        "--tty",
        "--workdir",
        "/source",
        "--publish",
        `${port}:8080`,
        "--env",
        `MENDIX_VERSION=${mendixVersion}`,
        "--entrypoint",
        "/bin/bash",
        "--volume",
        `${REPO_ROOT}:/source`,
        "--volume",
        `${PATHS.dockerDir}:/shared:ro`,
        "--label",
        containerLabel,
        `mxruntime:${mendixVersion}`,
        "/shared/runtime.sh"
    ];

    spawn("docker", args, { stdio: VERBOSE ? "inherit" : "ignore", detached: true }).unref();

    // Poll for the container ID
    let containerId = "";
    for (let i = DOCKER.CONTAINER_ID_POLL_ATTEMPTS; i > 0; --i) {
        try {
            const { stdout } = await execAsync(`docker ps --quiet --filter 'label=${containerLabel}'`);
            containerId = stdout.trim();
            if (containerId) break;
        } catch {
            // keep polling
        }
        await sleep(DOCKER.CONTAINER_ID_POLL_INTERVAL_MS);
    }

    if (!containerId) {
        spinner.fail("Could not get runtime container ID — it may not have started");
        bail("Mendix runtime container did not start.");
    }

    spinner.succeed(`Mendix runtime started ${DIM(`(container ${containerId.slice(0, 12)})`)}`);
    return { port, containerId };
}

async function waitForRuntime(port) {
    const spinner = new Spinner(`Waiting for Mendix runtime on port ${port}`).start();

    for (let i = DOCKER.RUNTIME_HEALTH_ATTEMPTS; i > 0; --i) {
        if (await httpHeadOk(port)) {
            spinner.succeed(`Mendix runtime is ready ${DIM(`(http://localhost:${port})`)}`);
            return;
        }
        log(`Runtime not ready yet (${i} attempts left)…`);
        await sleep(DOCKER.RUNTIME_HEALTH_INTERVAL_MS);
    }

    spinner.fail("Mendix runtime did not become ready in time");

    // Try to print the runtime log for debugging
    const runtimeLog = path.join(REPO_ROOT, "results/runtime.log");
    if (fs.existsSync(runtimeLog)) {
        console.error(RED("\n  Runtime log:"));
        console.error(DIM(fs.readFileSync(runtimeLog, "utf8").slice(-4000)));
    }

    bail("Runtime timed out. Check Docker logs or enable --verbose for more detail.");
}

// ─── Playwright tests ────────────────────────────────────────────────────────

async function runPlaywrightTests(widgetName, port, tmpDir) {
    const spinner = new Spinner(`Running Playwright screenshot update for ${BOLD(widgetName)}`).start();

    // Resolve a routable host IP from inside the Playwright container
    const nets = os.networkInterfaces();
    let hostIp = "host.docker.internal"; // works on macOS/Windows Docker Desktop
    for (const iface of Object.values(nets).flat()) {
        if (iface.family === "IPv4" && !iface.internal) {
            hostIp = iface.address;
            break;
        }
    }

    const scriptPath = path.join(tmpDir, "pw-update.sh");
    fs.writeFileSync(
        scriptPath,
        [
            "#!/bin/bash",
            "set -e",
            "# Use the browsers pre-installed in the Playwright Docker image.",
            "# PLAYWRIGHT_BROWSERS_PATH must match the image's pre-installed browser path.",
            "export CI=true DEBIAN_FRONTEND=noninteractive SHELL=/bin/bash",
            "export PLAYWRIGHT_BROWSERS_PATH=/ms-playwright",
            "",
            `cd /workspace/packages/pluggableWidgets/${widgetName}`,
            "",
            `export URL="http://${hostIp}:${port}"`,
            `echo "── Testing connectivity to Mendix runtime at $URL …"`,
            `curl -s --head "$URL" >/dev/null 2>&1 || echo "  ⚠ Warning: could not reach $URL"`,
            "",
            "echo '── Running Playwright …'",
            "npx playwright test --update-snapshots --update-source-method=overwrite \\",
            "  --project=chromium --reporter=list --workers=1 --timeout=30000",
            "",
            `SNAP_COUNT=$(find e2e/ -name "*.png" 2>/dev/null | wc -l | tr -d ' ')`,
            `echo "── Updated $SNAP_COUNT screenshot(s)"`
        ].join("\n"),
        { mode: 0o755 }
    );

    const dockerCmd = [
        "docker",
        "run",
        "--rm",
        "--network",
        "host",
        "--volume",
        `${REPO_ROOT}:/workspace`,
        "--volume",
        `${scriptPath}:/tmp/pw-update.sh`,
        "--env",
        `URL=http://${hostIp}:${port}`,
        DOCKER.PLAYWRIGHT_IMAGE,
        "bash",
        "/tmp/pw-update.sh"
    ];

    log(`Docker run: ${dockerCmd.join(" ")}`);

    try {
        execSync(dockerCmd.join(" "), { stdio: "inherit" });
        spinner.succeed(`Screenshots updated for ${BOLD(widgetName)}`);
    } catch (err) {
        spinner.fail(`Playwright run failed (exit ${err.status})`);
        bail("Screenshot update failed. See Playwright output above.");
    } finally {
        try {
            fs.rmSync(scriptPath, { force: true });
        } catch {
            // non-fatal
        }
    }
}

// ─── Cleanup ──────────────────────────────────────────────────────────────────

async function cleanup(containerId, tmpDir) {
    const tasks = [];

    if (containerId) {
        tasks.push(
            execAsync(`docker rm -f ${containerId}`).catch(err =>
                log(`Could not stop runtime container: ${err.message}`)
            )
        );
    }

    if (fs.existsSync(PATHS.deployBundle)) {
        tasks.push(fsp.unlink(PATHS.deployBundle).catch(() => {}));
    }

    if (tmpDir && fs.existsSync(tmpDir)) {
        tasks.push(fsp.rm(tmpDir, { recursive: true, force: true }).catch(() => {}));
    }

    await Promise.allSettled(tasks);
    log("Cleanup complete");
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function formatVersion(key, value) {
    return key === "latest" ? `${CYAN(key.padEnd(8))} ${GREEN(value)}` : `${BLUE(key.padEnd(8))} ${DIM(value)}`;
}

// ─── Subcommand: list ─────────────────────────────────────────────────────────

async function cmdList() {
    const spinner = new Spinner("Scanning for widgets with e2e tests").start();
    const widgets = await getWidgetsWithE2e();
    spinner.succeed(`Found ${GREEN(String(widgets.length))} widget(s) with e2e tests`);
    console.log();
    for (const w of widgets) {
        console.log(`  ${CYAN("·")} ${w}`);
    }
    console.log();
}

// ─── Subcommand: versions ─────────────────────────────────────────────────────

function cmdVersions() {
    const versions = loadMendixVersions();
    console.log(`\n  ${BOLD("Available Mendix versions:")}\n`);
    for (const [key, value] of Object.entries(versions)) {
        console.log(`  ${formatVersion(key, value)}`);
    }
    console.log();
}

// ─── Subcommand: update ───────────────────────────────────────────────────────

async function cmdUpdate(widgetName) {
    if (!widgetName) {
        console.error(`\n ${RED("✖")} Missing argument: ${YELLOW("<widget-name>")}\n`);
        console.log(USAGE);
        process.exit(1);
    }

    const versions = loadMendixVersions();
    const mendixVersion = MENDIX_VERSION_OPT || versions.latest;
    const tmpDir = createTempDir();
    let containerId = null;

    // Register cleanup handlers
    const onExit = () => cleanup(containerId, tmpDir).finally(() => process.exit(1));
    process.once("SIGINT", onExit);
    process.once("SIGTERM", onExit);

    console.log(
        "\n" +
            box([BOLD("🖼  Screenshot Updater — Local"), DIM("Mendix Web Widgets · Docker + Mendix runtime")], CYAN) +
            "\n"
    );

    console.log(`  ${DIM("Widget         ")} ${CYAN(widgetName)}`);
    console.log(`  ${DIM("Mendix version ")} ${CYAN(mendixVersion)}`);
    console.log(`  ${DIM("Skip Atlas     ")} ${SKIP_ATLAS ? YELLOW("yes") : DIM("no")}`);
    if (!GH_TOKEN && !SKIP_ATLAS) {
        console.log(
            `\n  ${YELLOW("⚠")} No GitHub token — Atlas updates will be skipped.\n  ${DIM("Set GITHUB_TOKEN or use --token to enable them.")}`
        );
    }
    console.log("\n" + divider());

    // ── 1. Validate prerequisites ─────────────────────────────────────────────

    info("Checking prerequisites…");
    if (!(await isDockerRunning())) {
        bail("Docker is not running. Start Docker Desktop and try again.");
    }

    const allWidgets = await getWidgetsWithE2e();
    if (!allWidgets.includes(widgetName)) {
        bail(
            `Widget '${widgetName}' not found or has no e2e tests.\n` +
                `  Run ${CYAN("update-screenshots-local list")} to see available widgets.`
        );
    }

    const widgetPkg = await getWidgetPackageJson(widgetName);
    if (!widgetPkg.testProject) {
        bail(`Widget '${widgetName}' is missing a ${YELLOW("testProject")} field in its package.json.`);
    }

    console.log("\n" + divider());

    // ── 2. Download test project ──────────────────────────────────────────────

    await downloadTestProject(widgetPkg.testProject, tmpDir);

    // ── 3. Update Atlas (optional) ────────────────────────────────────────────

    if (!SKIP_ATLAS && GH_TOKEN) {
        await updateAtlasTheme(PATHS.testProject, tmpDir);
        await updateAtlasThemesource(PATHS.testProject, tmpDir);
    } else if (!SKIP_ATLAS && !GH_TOKEN) {
        log("Skipping Atlas update — no token");
    } else {
        log("Skipping Atlas update — --skip-atlas flag set");
    }

    console.log("\n" + divider());

    // ── 4. Build widget ───────────────────────────────────────────────────────

    await buildWidget(widgetName, widgetPkg);

    // ── 5. Build deployment bundle (mxbuild) ──────────────────────────────────

    await buildDeploymentBundle(mendixVersion);

    console.log("\n" + divider());

    // ── 6. Start Mendix runtime ───────────────────────────────────────────────

    const runtime = await startMendixRuntime(mendixVersion);
    containerId = runtime.containerId;

    // ── 7. Wait for runtime ───────────────────────────────────────────────────

    await waitForRuntime(runtime.port);

    console.log("\n" + divider());

    // ── 8. Run Playwright ─────────────────────────────────────────────────────

    await runPlaywrightTests(widgetName, runtime.port, tmpDir);

    // ── 9. Cleanup ────────────────────────────────────────────────────────────

    console.log("\n" + divider() + "\n");
    const cleanupSpinner = new Spinner("Cleaning up containers and temp files").start();
    await cleanup(containerId, tmpDir);
    containerId = null;
    cleanupSpinner.succeed("Cleanup complete");

    console.log(
        "\n" +
            box(
                [
                    BOLD("✔  Screenshots updated successfully"),
                    "",
                    `  ${MAGENTA(widgetName)} baselines are ready to commit.`
                ],
                GREEN
            ) +
            "\n"
    );
}

// ─── Entry point ─────────────────────────────────────────────────────────────

async function main() {
    switch (SUBCOMMAND) {
        case "list":
            await cmdList();
            break;
        case "versions":
            cmdVersions();
            break;
        case "update":
            await cmdUpdate(positionals[1]);
            break;
        default:
            console.error(`\n ${RED("✖")} Unknown command: ${YELLOW(SUBCOMMAND)}\n`);
            console.log(USAGE);
            process.exit(1);
    }
}

main().catch(err => {
    console.error(`\n ${RED("✖ Unexpected error:")} ${err.message}\n`);
    if (VERBOSE) console.error(err);
    process.exit(1);
});

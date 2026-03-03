#!/usr/bin/env node
const { execSync } = require("child_process");
const { statSync, readdirSync, mkdirSync, rmSync, copyFileSync } = require("fs");
const path = require("path");
const repoRoot = path.resolve(__dirname, "../../..");

function getFolderSize(folder) {
    let total = 0;
    if (!require("fs").existsSync(folder)) {
        return 0;
    }
    const entries = readdirSync(folder, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(folder, entry.name);
        if (entry.isDirectory()) {
            total += getFolderSize(fullPath);
        } else if (entry.isFile()) {
            total += statSync(fullPath).size;
        }
    }
    return total;
}

function getMpkSizes(folder, relative = "") {
    const result = new Map();
    if (!require("fs").existsSync(folder)) {
        return result;
    }
    const entries = readdirSync(folder, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(folder, entry.name);
        const relPath = path.join(relative, entry.name);
        if (entry.isDirectory()) {
            const nested = getMpkSizes(fullPath, relPath);
            for (const [key, size] of nested.entries()) {
                result.set(key, size);
            }
        } else if (entry.isFile() && entry.name.endsWith(".mpk")) {
            result.set(relPath, statSync(fullPath).size);
        }
    }
    return result;
}

function formatDelta(oldSize, newSize) {
    const delta = newSize - oldSize;
    const direction = delta >= 0 ? "+" : "-";
    const absDelta = Math.abs(delta);
    const pct = oldSize === 0 ? null : (delta / oldSize) * 100;
    const pctText = pct === null ? "n/a" : `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
    return `${direction}${human(absDelta)} (${pctText})`;
}

function formatSpeed(oldTimeMs, newTimeMs) {
    if (newTimeMs <= 0) {
        return "n/a";
    }
    const ratio = oldTimeMs / newTimeMs;
    const pctLessTime = oldTimeMs <= 0 ? null : ((oldTimeMs - newTimeMs) / oldTimeMs) * 100;
    const ratioText = `${ratio.toFixed(2)}x faster`;
    const pctText = pctLessTime === null ? "n/a" : `${pctLessTime.toFixed(2)}% less time`;
    return `${ratioText} (${pctText})`;
}

function sumMapValues(map) {
    let total = 0;
    for (const value of map.values()) {
        total += value;
    }
    return total;
}

function pad(text, width) {
    return String(text).padEnd(width, " ");
}

function runCommand(cmd, opts = {}) {
    const start = process.hrtime.bigint();
    execSync(cmd, { stdio: "inherit", ...opts });
    const end = process.hrtime.bigint();
    return Number(end - start) / 1e6; // ms
}

function copyFolder(src, dest) {
    if (require("fs").existsSync(dest)) {
        rmSync(dest, { recursive: true, force: true });
    }
    mkdirSync(dest, { recursive: true });
    const entries = readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const s = path.join(src, entry.name);
        const d = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyFolder(s, d);
        } else if (entry.isFile()) {
            copyFileSync(s, d);
        }
    }
}

function human(bytes) {
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
        bytes /= 1024;
        i++;
    }
    return `${bytes.toFixed(2)} ${units[i]}`;
}

function patchViteRollup() {
    const glob = require("glob");
    const fs = require("fs");
    const matches = glob.sync(path.join(repoRoot, "node_modules/.pnpm/**/node_modules/rollup/package.json"));
    for (const file of matches) {
        let text = fs.readFileSync(file, "utf-8");
        if (!text.includes('"./parseAst"')) {
            text = text.replace(/"exports"\s*:\s*{/, '"exports":{ "./parseAst": "./dist/rollup.js",');
            fs.writeFileSync(file, text);
        }
    }
}

function main() {
    const pkg = process.argv[2];
    if (!pkg) {
        console.error("Usage: node benchmark.js <package-name (workspace alias)>");
        process.exit(1);
    }
    console.log(`benchmarking ${pkg}`);
    const simpleName = pkg.replace(/^@mendix\//, "");
    const pkgDir = path.join(repoRoot, "packages/pluggableWidgets", simpleName);
    const outDir = path.join(pkgDir, "dist");
    const benchDir = path.join(repoRoot, ".benchmark", simpleName);

    // ensure clean
    rmSync(benchDir, { recursive: true, force: true });
    mkdirSync(benchDir, { recursive: true });

    console.log("=> running legacy rollup build");
    const t1 = runCommand(`pnpm --filter ${pkg} run build`, { cwd: repoRoot });
    const size1 = getFolderSize(outDir);
    const mpk1 = getMpkSizes(outDir);
    copyFolder(outDir, path.join(benchDir, "old"));

    console.log("=> patching vite/rollup exports");
    patchViteRollup();

    console.log("=> running vite build");
    const t2 = runCommand(`pnpm --filter ${pkg} run build:vite`, { cwd: repoRoot });
    const size2 = getFolderSize(outDir);
    const mpk2 = getMpkSizes(outDir);
    copyFolder(outDir, path.join(benchDir, "new"));

    const mpkTotal1 = sumMapValues(mpk1);
    const mpkTotal2 = sumMapValues(mpk2);
    const legacySpeed = `${t1.toFixed(1)}ms`;
    const viteSpeed = `${t2.toFixed(1)}ms`;
    const deltaSpeed = formatSpeed(t1, t2);
    const legacyDist = human(size1);
    const viteDist = human(size2);
    const deltaDist = formatDelta(size1, size2);
    const legacyMpk = human(mpkTotal1);
    const viteMpk = human(mpkTotal2);
    const deltaMpk = formatDelta(mpkTotal1, mpkTotal2);

    const speedWidth = Math.max(legacySpeed.length, viteSpeed.length, deltaSpeed.length);
    const distWidth = Math.max(legacyDist.length, viteDist.length, deltaDist.length);
    const mpkWidth = Math.max(legacyMpk.length, viteMpk.length, deltaMpk.length);

    console.log("\nresults:\n");
    console.log(
        `legacy: speed ${pad(legacySpeed, speedWidth)} | dist ${pad(legacyDist, distWidth)} | mpk ${pad(legacyMpk, mpkWidth)}`
    );
    console.log(
        `vite  : speed ${pad(viteSpeed, speedWidth)} | dist ${pad(viteDist, distWidth)} | mpk ${pad(viteMpk, mpkWidth)}`
    );
    console.log(
        `delta : speed ${pad(deltaSpeed, speedWidth)} | dist ${pad(deltaDist, distWidth)} | mpk ${pad(deltaMpk, mpkWidth)}`
    );
    console.log(`output copies in ${benchDir}`);
}

main();

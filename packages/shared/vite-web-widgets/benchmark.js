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
    copyFolder(outDir, path.join(benchDir, "old"));

    console.log("=> patching vite/rollup exports");
    patchViteRollup();

    console.log("=> running vite build");
    const t2 = runCommand(`pnpm --filter ${pkg} run build:vite`, { cwd: repoRoot });
    const size2 = getFolderSize(outDir);
    copyFolder(outDir, path.join(benchDir, "new"));

    console.log("\nresults:\n");
    console.log(`legacy build: ${t1.toFixed(1)}ms, size ${human(size1)}`);
    console.log(`vite build : ${t2.toFixed(1)}ms, size ${human(size2)}`);
    console.log(`output copies in ${benchDir}`);
}

main();

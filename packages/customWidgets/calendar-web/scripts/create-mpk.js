const { execSync } = require("node:child_process");
const { join } = require("path");
const { rm, mkdir } = require("node:fs/promises");
const cwd = process.cwd();
const package = require(join(cwd, "package.json"));
const widgetName = package.widgetName;
const filesDir = join(cwd, "dist", "tmp", "widgets");
const dest = join(cwd, "dist", package.version);
const outputFile = join(dest, `${widgetName}.mpk`);

async function main() {
    await rm(dest, { force: true, recursive: true });
    await mkdir(dest, { recursive: true });
    process.chdir(filesDir);
    execSync(`zip -vr ${outputFile} .`, { stdio: "inherit" });
    process.chdir(cwd);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});

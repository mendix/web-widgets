import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
const require = createRequire(import.meta.url);
const lastSync = require("./sync-last-revision.json");

// This approach is taken from
// https://stackoverflow.com/questions/1365541/how-to-move-some-files-from-one-git-repo-to-another-not-a-clone-preserving-hi

const GENERATOR_PATH = `packages/pluggable-widgets-tools/src/typings-generator`;
const NEW_GENERATOR_PATH = `packages/shared/typings-generator/src/__no_modify__`;

const exec = cmd => execSync(cmd, { stdio: "inherit" });
const execRead = cmd => execSync(cmd).toString("utf-8").trim();

function main() {
    cloneWidgetsTools();
    process.chdir("./widgets-tools");
    const count = checkForNewCommits({
        lastRev: lastSync.revision,
        generatorDir: GENERATOR_PATH
    });

    if (count > 0) {
        console.log(`Found ${count} new commit(s) to generator.`);
        console.log(`Begin sync.`);

        createPatch({
            pathToSave: "./next.patch",
            generatorDir: GENERATOR_PATH
        });
        const newRevision = getMasterRevision();
        process.chdir("..");
        saveLastRevision(newRevision);
        applyPatch({
            patchPath: "./widgets-tools/next.patch",
            newDirectory: NEW_GENERATOR_PATH
        });
        console.log("Done.");
        printReminder();
    } else {
        console.log(`No new commits were found. Skip sync.`);
    }

    process.exit(0);
}

main();

function cloneWidgetsTools() {
    exec(`git clone https://github.com/mendix/widgets-tools`);
}

function checkForNewCommits({ lastRev, generatorDir }) {
    const command = [
        //
        `git rev-list`,
        `--count`,
        `${lastRev}..master`,
        `--`,
        generatorDir
    ].join(" ");

    return parseInt(execRead(command), 10);
}

function createPatch({ pathToSave, generatorDir }) {
    const command = [
        //
        `git log`,
        `--pretty=email`,
        `--reverse`,
        `--full-index`,
        `--binary`,
        `--diff-merges=m`,
        `--first-parent`,
        `${lastSync.revision}..master`,
        `--`,
        generatorDir,
        `> ${pathToSave}`
    ].join(" ");

    exec(command);
}

function getMasterRevision() {
    return execRead(`git rev-parse master`);
}

function applyPatch(params) {
    const { patchPath, newDirectory } = params;
    const command = [
        //
        `git am`,
        `--directory=${newDirectory}`,
        // -p<n> Remove <n> leading path components (separated by slashes)
        `-p5`,
        `--committer-date-is-author-date`,
        `< ${patchPath}`
    ].join(" ");

    exec(command);
}

function saveLastRevision(revision) {
    writeFileSync("sync-last-revision.json", JSON.stringify({ revision }, null, 4), { encoding: "utf-8" });
}

function printReminder() {
    const msg = [
        "Please stage and commit the sync-last-revision.json",
        "as this file is required for script in order to work correctly.",
        "If you don't commit this file, next time you run the script you",
        "will have all sort of git troubles."
    ];

    const yellow = str => `${"\x1b[33m"}${str}\x1b[0m`;

    console.log(yellow(msg.join("\n")));
}

#!/usr/bin/env ts-node-script

import { prompt } from "enquirer";
import { selectPackage } from "../src";
import { getNextVersion, writeVersion } from "../src/bump-version";

import { oraPromise } from "../src/cli-utils";

async function main(): Promise<void> {
    const pkg = await selectPackage();
    const nextVersion = await getNextVersion(pkg.version);

    const { save } = await prompt<{ save: boolean }>({
        type: "confirm",
        name: "save",
        message: "Save changes?"
    });

    if (save) {
        await oraPromise(writeVersion(pkg, nextVersion), "Writing changes...");
        console.log("Done.");
    } else {
        console.log("Exit without changes.");
    }
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});

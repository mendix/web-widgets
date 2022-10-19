#!/usr/bin/env ts-node-script

import { getPackageInfo } from "../src";
import { getWidgetChangelog } from "../src/changelog-parser";

async function main(): Promise<void> {
    const info = await getPackageInfo(process.cwd());
    const changelog = await getWidgetChangelog(process.cwd());

    console.log("Updating changelog...");
    changelog.moveUnreleasedToVersion(info.version).save();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});

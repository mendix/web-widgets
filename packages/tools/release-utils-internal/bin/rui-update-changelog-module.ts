#!/usr/bin/env ts-node-script

import { getModuleInfo } from "../src";
import { getModuleChangelog } from "../src/changelog-parser";

async function main(): Promise<void> {
    const info = await getModuleInfo(process.cwd());
    const changelog = await getModuleChangelog(process.cwd(), info.mxpackage.name);

    console.dir(changelog, { depth: 10 });
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});

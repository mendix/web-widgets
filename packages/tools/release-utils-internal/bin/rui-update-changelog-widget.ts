#!/usr/bin/env ts-node-script

import { getWidgetChangelog } from "../src/changelog-parser";

async function main(): Promise<void> {
    const changelog = await getWidgetChangelog(process.cwd());

    console.dir(changelog, { depth: 10 });
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});

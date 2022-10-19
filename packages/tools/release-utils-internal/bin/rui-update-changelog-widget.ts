#!/usr/bin/env ts-node-script

// import { getWidgetInfo  } from "../src";
import { getWidgetChangelog } from "../src/changelog-parser";

async function main(): Promise<void> {
    // const info = await getWidgetInfo(process.cwd());
    const changelog = await getWidgetChangelog(process.cwd());
    // const newVersion = info.version.bumpMinor();
    // const newChangelog = changelog.moveUnreleasedToVersion(newVersion);

    console.dir(changelog, { depth: 10 });

    // newChangelog.save();
    changelog.save();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});

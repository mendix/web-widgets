#!/usr/bin/env ts-node-script

import { getModuleChangelog, getWidgetChangelog } from "../src/changelog-parser";
import { getPackageInfo } from "../src/package-info";

async function main(): Promise<void> {
    const path = process.cwd();
    const info = await getPackageInfo(path);

    const changelog =
        info.mxpackage.type === "widget" && info.mxpackage.changelogType === "widget"
            ? await getWidgetChangelog(path)
            : await getModuleChangelog(path, info.mxpackage.name);

    const unreleased = changelog.changelog.content[0];

    console.log(
        JSON.stringify({
            hasUnreleasedLogs: changelog.hasUnreleasedLogs(),
            sections: unreleased.sections,
            subcomponents: "subcomponents" in unreleased ? unreleased.subcomponents : undefined
        })
    );
}

main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
});

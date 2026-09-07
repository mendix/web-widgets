#!/usr/bin/env ts-node-script

import {
    getModuleChangelog,
    getWidgetChangelog,
    ModuleChangelogFileWrapper,
    WidgetChangelogFileWrapper
} from "../src/changelog-parser";
import { getPackageInfo } from "../src/package-info";

async function main(): Promise<void> {
    const path = process.cwd();
    const info = await getPackageInfo(path);

    let changelog: WidgetChangelogFileWrapper | ModuleChangelogFileWrapper;
    try {
        changelog = await getWidgetChangelog(path);
    } catch {
        changelog = await getModuleChangelog(path, info.mxpackage.name);
    }

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

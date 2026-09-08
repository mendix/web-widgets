#!/usr/bin/env ts-node-script

import { getPackageChangelog } from "../src/changelog-parser";
import { resolvePackagePath } from "../src/monorepo";
import { getPackageInfo, isReleasable } from "../src/package-info";

async function main(): Promise<void> {
    const npmPackageName = process.argv[2];

    if (!npmPackageName) {
        throw new Error("Usage: rui-changelog <npm-package-name>\nExample: rui-changelog @mendix/combobox-web");
    }

    const path = await resolvePackagePath(npmPackageName);
    const info = await getPackageInfo(path);

    if (!isReleasable(info)) {
        throw new Error(
            `'${npmPackageName}' has no positive marketplace.appNumber, so it is not published on its own. If it is a widget, read the changelog of the module wrapping it instead.`
        );
    }

    const changelog = await getPackageChangelog(path);
    // The parsers keep the Unreleased entry first, released versions follow.
    const unreleased = changelog.changelog.content[0];
    const subcomponents = "subcomponents" in unreleased ? unreleased.subcomponents : [];

    console.log(
        JSON.stringify({
            hasUnreleasedLogs: changelog.hasUnreleasedLogs(),
            sections: unreleased.sections,
            subcomponents
        })
    );
}

main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
});

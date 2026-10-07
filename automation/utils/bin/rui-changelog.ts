#!/usr/bin/env ts-node-script

import { getPackageChangelog, getWidgetChangelog } from "../src/changelog-parser";
import { SubComponentEntry } from "../src/changelog-parser/types";
import { listPackages, resolvePackagePath } from "../src/monorepo";
import { getPackageInfo, isReleasable } from "../src/package-info";

/**
 * A module's own CHANGELOG.md never carries unreleased subcomponent entries:
 * they're only added there (and immediately moved into a release) by
 * rui-update-changelog-module, at release time. Before that, unreleased work
 * for a wrapped widget lives solely in that widget's own CHANGELOG.md.
 */
async function getUnreleasedSubcomponents(dependencyNames: string[]): Promise<SubComponentEntry[]> {
    const dependencies = await listPackages(dependencyNames);
    const entries = await Promise.all(
        dependencies.map(async ({ path }) => {
            const depInfo = await getPackageInfo(path);
            const [unreleased] = (await getWidgetChangelog(path)).changelog.content;
            return { name: depInfo.mxpackage.name, sections: unreleased.sections };
        })
    );

    return entries.filter(entry => entry.sections.length !== 0);
}

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
    const subcomponents =
        "subcomponents" in unreleased ? await getUnreleasedSubcomponents(info.mxpackage.dependencies) : [];

    console.log(
        JSON.stringify({
            hasUnreleasedLogs: unreleased.sections.length !== 0 || subcomponents.length !== 0,
            sections: unreleased.sections,
            subcomponents
        })
    );
}

main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
});

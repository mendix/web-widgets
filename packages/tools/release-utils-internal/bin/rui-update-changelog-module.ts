#!/usr/bin/env ts-node-script

import { getPackageInfo, listPackages, Version } from "../src";
import { getModuleChangelog, getWidgetChangelog } from "../src/changelog-parser";
import { SubComponentEntry } from "../src/changelog-parser/types";

function alreadyReleased(name: string, version: Version): string {
    return `Failed to update changelog in ${name}: version ${version.format()} already released`;
}

async function main(): Promise<void> {
    const info = await getPackageInfo(process.cwd());
    const moduleChangelog = await getModuleChangelog(process.cwd(), info.mxpackage.name);
    const dependencies = await listPackages(info.mxpackage.dependencies);

    console.info("Read components changelog");
    const childChangelogs = await Promise.all(
        dependencies.map(async ({ path }) => {
            const pkgInfo = await getPackageInfo(path);
            const pkgChangelog = await getWidgetChangelog(path);

            return [pkgInfo, pkgChangelog] as const;
        })
    );

    const subcomponents = childChangelogs.flatMap(([compInfo, wrapper]) => {
        return wrapper.hasUnreleasedLogs() ? [[compInfo, wrapper] as const] : [];
    });

    if (!moduleChangelog.hasUnreleasedLogs() && !subcomponents.length) {
        throw new Error("No unreleased entires found in module or it's components");
    }

    console.info("Update components changelog");
    for (const [compInfo, wrapper] of subcomponents) {
        if (wrapper.hasVersion(compInfo.version)) {
            throw new Error(alreadyReleased(compInfo.mxpackage.name, info.version));
        }

        wrapper.moveUnreleasedToVersion(compInfo.version).save();
    }

    if (moduleChangelog.hasVersion(info.version)) {
        throw new Error(alreadyReleased(info.mxpackage.name, info.version));
    }

    console.info("Update module changelog");
    moduleChangelog
        .addUnreleasedSubcomponents(
            subcomponents.map(([compInfo, comp]) => {
                const [unreleased] = comp.changelog.content;
                const entry: SubComponentEntry = {
                    name: compInfo.mxpackage.name,
                    version: compInfo.version,
                    sections: unreleased.sections
                };

                return entry;
            })
        )
        .moveUnreleasedToVersion(info.version)
        .save();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});

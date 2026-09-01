#!/usr/bin/env ts-node-script

import { bumpPackageJson, bumpXml, getNewVersion } from "../src/bump-version";
import { getPackageInfo } from "../src/package-info";

async function main(): Promise<void> {
    const bumpType = process.argv[2];

    if (!bumpType) {
        throw new Error(
            "Usage: rui-bump-version <patch|minor|major|x.y.z>\nRun from inside the widget/module directory."
        );
    }

    const path = process.cwd();
    const info = await getPackageInfo(path);
    const previousVersion = info.version.format();
    const version = getNewVersion(bumpType, previousVersion);

    bumpPackageJson(path, version);

    let xmlBumped = true;
    try {
        await bumpXml(path, version);
    } catch {
        xmlBumped = false; // modules have no package.xml
    }

    console.log(JSON.stringify({ previousVersion, version, xmlBumped }));
}

main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
});

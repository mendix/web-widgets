#!/usr/bin/env ts-node-script

import { resolve } from "path";
import { bumpPackageJson, bumpXml, getNewVersion } from "../src/bump-version";
import { getModuleChangelog, getWidgetChangelog } from "../src/changelog-parser";
import { getPackageInfo } from "../src/package-info";

async function bumpPackage(path: string, version: string): Promise<boolean> {
    bumpPackageJson(path, version);
    try {
        await bumpXml(path, version);
        return true;
    } catch {
        return false; // modules have no package.xml
    }
}

async function hasUnreleasedLogs(path: string): Promise<boolean> {
    const info = await getPackageInfo(path);
    const changelog =
        info.mxpackage.type === "widget" && info.mxpackage.changelogType === "widget"
            ? await getWidgetChangelog(path)
            : await getModuleChangelog(path, info.mxpackage.name);
    return changelog.hasUnreleasedLogs();
}

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

    const xmlBumped = await bumpPackage(path, version);
    const bumpedPackages = [info.mxpackage.name];
    const changedPaths = [path];

    if (info.mxpackage.type === "module") {
        for (const dependencyName of info.mxpackage.dependencies) {
            const widgetFolder = dependencyName.replace(/^@mendix\//, "");
            const widgetPath = resolve(path, "..", "..", "pluggableWidgets", widgetFolder);

            if (await hasUnreleasedLogs(widgetPath)) {
                await bumpPackage(widgetPath, version);
                bumpedPackages.push(widgetFolder);
                changedPaths.push(widgetPath);
            }
        }
    }

    console.log(JSON.stringify({ previousVersion, version, xmlBumped, bumpedPackages, changedPaths }));
}

main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
});

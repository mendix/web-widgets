#!/usr/bin/env ts-node-script

import { bumpPackageJson, bumpXml, hasPackageXml } from "../src/bump-version";
import { resolvePackagePath } from "../src/monorepo";
import { getPackageInfo, isReleasable } from "../src/package-info";
import { Version, versionRegex } from "../src/version";

async function bumpPackage(path: string, version: string): Promise<void> {
    bumpPackageJson(path, version);

    if (!hasPackageXml(path)) {
        return; // modules have no package.xml
    }

    await bumpXml(path, version);
}

function checkVersion(version: string, previousVersion: string): void {
    if (!versionRegex.test(version)) {
        throw new Error(`'${version}' is not a valid version number (expected x.y.z)`);
    }

    if (!Version.fromString(version).isGreaterThan(Version.fromString(previousVersion))) {
        throw new Error(`Version '${version}' is not greater than the current version '${previousVersion}'`);
    }
}

async function main(): Promise<void> {
    const npmPackageName = process.argv[2];
    const version = process.argv[3];

    if (!npmPackageName || !version) {
        throw new Error(
            "Usage: rui-bump-version <npm-package-name> <x.y.z>\nExample: rui-bump-version @mendix/combobox-web 1.2.3"
        );
    }

    const path = await resolvePackagePath(npmPackageName);
    const info = await getPackageInfo(path);

    if (!isReleasable(info)) {
        throw new Error(
            `'${npmPackageName}' has no positive marketplace.appNumber, so it is not published on its own. If it is a widget, bump the module wrapping it instead.`
        );
    }

    const previousVersion = info.version.format();
    checkVersion(version, previousVersion);

    await bumpPackage(path, version);
    const bumpedPackages = [info.name];
    const changedPaths = [path];

    // Wrapped widgets are released as part of the target and share its version,
    // so all of them are bumped, not only the ones with changelog entries.
    for (const dependencyName of info.mxpackage.dependencies) {
        const dependencyPath = await resolvePackagePath(dependencyName);

        await bumpPackage(dependencyPath, version);
        bumpedPackages.push(dependencyName);
        changedPaths.push(dependencyPath);
    }

    console.log(JSON.stringify({ previousVersion, version, bumpedPackages, changedPaths }));
}

main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
});

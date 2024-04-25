import chalk from "chalk";
import { spawnSync } from "child_process";
import { prompt } from "enquirer";
import { promises as fs } from "fs";
import { join } from "path";
import { nextTick } from "process";
import { PackageListing } from "./monorepo";

export type BumpVersionType = "patch" | "minor" | "major" | string;

export function getNewVersion(bumpVersionType: BumpVersionType, currentVersion: string): string {
    const [major, minor, patch] = currentVersion.split(".");
    switch (bumpVersionType) {
        case "patch":
            return [major, minor, Number(patch) + 1].join(".");
        case "minor":
            return [major, Number(minor) + 1, 0].join(".");
        case "major":
            return [Number(major) + 1, 0, 0].join(".");
        default:
            return bumpVersionType;
    }
}

export function bumpPackageJson(path: string, version: string): void {
    spawnSync("npm", ["version", version], { cwd: path });
}

export async function bumpXml(path: string, version: string): Promise<boolean> {
    const packageXmlFile = join(path, "src", "package.xml");
    try {
        const content = await fs.readFile(packageXmlFile);
        if (content) {
            const newContent = content.toString().replace(/version=.+xmlns/, `version="${version}" xmlns`);
            await fs.writeFile(packageXmlFile, newContent);
            return true;
        }
        return false;
    } catch (e) {
        throw new Error("package.xml not found");
    }
}

export async function writeVersion(pkg: PackageListing, version: string): Promise<void> {
    bumpPackageJson(pkg.path, version);
    try {
        await bumpXml(pkg.path, version);
    } catch {
        nextTick(() => {
            const msg = `[WARN] Update version: package ${pkg.name} is missing package.xml, skip`;
            console.warn(chalk.yellow(msg));
        });
    }
}

export async function selectBumpVersionType(currentVersion: string): Promise<BumpVersionType> {
    const { bumpType } = await prompt<{ bumpType: string }>({
        type: "autocomplete",
        name: "bumpType",
        message: "Want to bump?",
        choices: [
            {
                name: `patch [${currentVersion} -> ${getNewVersion("patch", currentVersion)}]`,
                value: "patch"
            },
            {
                name: `minor [${currentVersion} -> ${getNewVersion("minor", currentVersion)}]`,
                value: "minor"
            },
            {
                name: `major [${currentVersion} -> ${getNewVersion("major", currentVersion)}]`,
                value: "major"
            },
            {
                name: "Set manually",
                value: "set manually"
            }
        ]
    });

    if (bumpType === "set manually") {
        const { nextVersion } = await prompt<{ nextVersion: string }>({
            type: "input",
            name: "nextVersion",
            message: "Set package version to"
        });

        return nextVersion;
    } else {
        return bumpType;
    }
}

export async function getNextVersion(currentVersion: string): Promise<string> {
    const bumpVersionType = await selectBumpVersionType(currentVersion);
    const nextVersion = getNewVersion(bumpVersionType, currentVersion);
    console.log(chalk.green(`Version change: ${currentVersion} => ${nextVersion}`));
    return nextVersion;
}

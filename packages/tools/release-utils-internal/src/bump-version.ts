import { promises as fs } from "fs";
import { join } from "path";
import { spawnSync } from "child_process";
import { prompt } from "enquirer";

export async function selectBumpVersionType(): Promise<BumpVersionType> {
    const { bumpType } = await prompt<{ bumpType: string }>({
        type: "autocomplete",
        name: "bumpType",
        message: "Want to bump?",
        choices: ["major", "minor", "patch", "set manually"]
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
    const bumpVersionType = await selectBumpVersionType();
    return getNewVersion(bumpVersionType, currentVersion);
}

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

export async function updateVersion(path: string, version: string): Promise<void> {
    bumpPackageJson(path, version);
    await bumpXml(path, version);
}

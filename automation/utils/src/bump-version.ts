import { spawnSync } from "child_process";
import { existsSync, promises as fs, readFileSync } from "fs";
import { join } from "path";
import { nextTick } from "process";
import chalk from "chalk";
import { prompt } from "enquirer";
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

export function packageXmlPath(path: string): string {
    return join(path, "src", "package.xml");
}

export function hasPackageXml(path: string): boolean {
    return existsSync(packageXmlPath(path));
}

/**
 * `pnpm version` reports failures (invalid or unchanged version) on stderr and
 * leaves the file alone, so the result is read back rather than trusted.
 */
export function bumpPackageJson(path: string, version: string): void {
    const packageJsonFile = join(path, "package.json");
    const result = spawnSync("pnpm", ["version", version], { cwd: path, encoding: "utf8" });
    const written = <string | undefined>JSON.parse(readFileSync(packageJsonFile, "utf8")).version;

    if (written !== version) {
        throw new Error(
            `Failed to set version '${version}' in ${packageJsonFile}, it is still '${written}'. ${(
                result.stderr ?? ""
            ).trim()}`
        );
    }
}

export async function bumpXml(path: string, version: string): Promise<boolean> {
    const packageXmlFile = packageXmlPath(path);

    if (!hasPackageXml(path)) {
        throw new Error(`package.xml not found at ${packageXmlFile}`);
    }

    const content = await fs.readFile(packageXmlFile);
    const newContent = content.toString().replace(/version=.+xmlns/, `version="${version}" xmlns`);
    await fs.writeFile(packageXmlFile, newContent);
    return true;
}

export async function writeVersion(pkg: PackageListing, version: string): Promise<void> {
    bumpPackageJson(pkg.path, version);

    if (!hasPackageXml(pkg.path)) {
        nextTick(() => {
            const msg = `[WARN] Update version: package ${pkg.name} is missing package.xml, skip`;
            console.warn(chalk.yellow(msg));
        });
        return;
    }

    await bumpXml(pkg.path, version);
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

import { join } from "path";
import { access } from "fs/promises";
import { Version, VersionString, ensureVersion } from "./version";
import { WidgetChangelogFileWrapper } from "./changelog-parser";
import { z } from "zod";

export const appNumberSchema = z.number().positive().int();
export const appNameSchema = z.string().min(1);

export interface PackageJsonFileContent {
    name?: string;
    widgetName?: string;
    moduleName?: string;
    version?: VersionString;

    repository?: {
        type: "git";
        url: string;
    };

    marketplace?: {
        minimumMXVersion: VersionString;
        marketplaceId?: number;
        appName?: string;
        appNumber?: number;
    };

    testProject?: {
        githubUrl: string;
        branchName: string;
    };

    packagePath?: string;
}

export interface PackageInfo {
    packageName: string;
    appName?: string;
    appNumber?: number;
    version: Version;
    repositoryUrl: string;
}

export interface PublishedPackageInfo extends PackageInfo {
    appName: z.infer<typeof appNameSchema>;
    appNumber: z.infer<typeof appNumberSchema>;
    minimumMXVersion: Version;
    repositoryUrl: string;
    testProjectUrl: string | undefined;
    testProjectBranchName: string | undefined;
}

export interface WidgetInfo extends PublishedPackageInfo {
    changelog: WidgetChangelogFileWrapper;
}

export interface ModuleInfo extends PublishedPackageInfo {
    testProjectUrl: string;
    testProjectBranchName: string;
    moduleNameInModeler: string;
    moduleFolderNameInModeler: string;
}

export async function getPackageFileContent(dirPath: string): Promise<PackageJsonFileContent> {
    const pkgPath = join(dirPath, `package.json`);
    try {
        await access(pkgPath);
        const result = (await import(pkgPath)) as PackageJsonFileContent;
        return result;
    } catch (error) {
        console.log(error);
        console.error(`ERROR: Path does not exist: ${pkgPath}`);
        throw new Error("Error while reading package info at " + dirPath);
    }
}

export async function getPackageInfo(path: string): Promise<PackageInfo> {
    const pkgPath = join(path, `package.json`);
    try {
        await access(pkgPath);
        const { name, version, repository, marketplace } = (await import(pkgPath)) as PackageJsonFileContent;
        return {
            packageName: ensureString(name, "name"),
            appName: marketplace?.appName,
            appNumber: marketplace?.appNumber ?? marketplace?.marketplaceId,
            version: ensureVersion(version),
            repositoryUrl: ensureString(repository?.url, "repository.url")
        };
    } catch (error) {
        console.log(error);
        console.error(`ERROR: Path does not exist: ${pkgPath}`);
        throw new Error("Error while reading package info at " + path);
    }
}

export async function getPublishedPackageInfo(path: string): Promise<PublishedPackageInfo> {
    const pkgPath = join(path, `package.json`);
    try {
        await access(pkgPath);
        const { name, version, repository, marketplace, testProject } = (await import(
            pkgPath
        )) as PackageJsonFileContent;

        return {
            packageName: ensureString(name, "name"),
            appName: appNameSchema.parse(marketplace?.appName),
            appNumber: appNumberSchema.parse(marketplace?.appNumber),
            version: ensureVersion(version),
            repositoryUrl: ensureString(repository?.url, "repository.url"),
            minimumMXVersion: ensureVersion(marketplace?.minimumMXVersion),
            testProjectUrl: testProject?.githubUrl,
            testProjectBranchName: testProject?.branchName
        };
    } catch (error) {
        console.log(error);
        console.error(`ERROR: Path does not exist: ${pkgPath}`);
        throw new Error("Error while reading package info at " + path);
    }
}

export async function getWidgetPackageInfo(path: string): Promise<WidgetInfo> {
    const info = await getPublishedPackageInfo(path);
    return {
        ...info,
        changelog: WidgetChangelogFileWrapper.fromFile(`${path}/CHANGELOG.md`)
    };
}

export async function getModulePackageInfo(pkgDir: string): Promise<ModuleInfo> {
    const {
        name,
        moduleName: moduleNameRaw,
        version,
        marketplace,
        testProject,
        repository
    } = await getPackageFileContent(pkgDir);
    const moduleName = ensureString(moduleNameRaw, "moduleName");
    return {
        packageName: ensureString(name, "name"),
        appName: appNameSchema.parse(marketplace?.appName),
        appNumber: appNumberSchema.parse(marketplace?.appNumber),
        moduleNameInModeler: moduleName,
        moduleFolderNameInModeler: moduleName.toLowerCase(),
        version: ensureVersion(version),
        minimumMXVersion: ensureVersion(marketplace?.minimumMXVersion),
        repositoryUrl: ensureString(repository?.url, "repository.url"),
        testProjectUrl: ensureString(testProject?.githubUrl, "testProject.githubUrl"),
        testProjectBranchName: ensureString(testProject?.branchName, "testProject.branchName")
    };
}

function ensureString(str: string | undefined, fieldName: string): string {
    if (typeof str === "undefined") {
        throw new Error(`Expected to be string got undefined for '${fieldName}'`);
    }

    return str;
}

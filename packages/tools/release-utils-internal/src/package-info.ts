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
    moduleNameInModeler?: string;
    moduleFolderNameInModeler?: string;
    version?: VersionString;
    private?: boolean;

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
    version: Version;
    minimumMXVersion: Version;
    repositoryUrl: string;
    testProjectUrl: string;
    testProjectBranchName: string;
    widgetName?: string;
    private?: boolean;
    appName: string;
    appNumber?: number;
}

export interface WidgetInfo extends PackageInfo {
    widgetName: string;
    changelog: WidgetChangelogFileWrapper;
}

export interface ModuleInfo extends PackageInfo {
    moduleNameInModeler: string;
    moduleFolderNameInModeler: string;
}

export interface PublishedPackageInfo extends PackageInfo {
    appNumber: number;
}

export interface PublishedModuleInfo extends ModuleInfo {
    appNumber: number;
}

export interface PublishedWidgetInfo extends WidgetInfo {
    appNumber: number;
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
        const {
            name,
            widgetName,
            version,
            repository,
            marketplace,
            testProject,
            private: privatePackage
        } = (await import(pkgPath)) as PackageJsonFileContent;
        return {
            packageName: ensureString(name, "name"),
            widgetName,
            version: ensureVersion(version),
            minimumMXVersion: ensureVersion(marketplace?.minimumMXVersion),
            repositoryUrl: ensureString(repository?.url, "repository.url"),
            private: privatePackage,
            appName: ensureString(marketplace?.appName, "appName"),
            appNumber: marketplace?.appNumber ?? marketplace?.marketplaceId,
            testProjectUrl: ensureString(testProject?.githubUrl, "testProject.githubUrl"),
            testProjectBranchName: ensureString(testProject?.branchName, "testProject.branchName")
        };
    } catch (error) {
        console.log(error);
        console.error(`ERROR: Path does not exist: ${pkgPath}`);
        throw new Error("Error while reading package info at " + path);
    }
}

export function ensurePublished(packageInfo: ModuleInfo): PublishedModuleInfo;
export function ensurePublished(packageInfo: WidgetInfo): PublishedWidgetInfo;
export function ensurePublished(packageInfo: PackageInfo): PublishedPackageInfo;
export function ensurePublished<T extends PackageInfo>(packageInfo: T): T {
    if (packageInfo.private) {
        throw new Error("Package is marked as private");
    }

    let appName: string;
    let appNumber: number;
    try {
        appName = appNameSchema.parse(packageInfo.appName);
    } catch {
        throw new Error("marketplace.appName is missing");
    }

    try {
        appNumber = appNumberSchema.parse(packageInfo.appNumber);
    } catch {
        throw new Error("marketplace.appNumber is missing, package is not published yet.");
    }

    return {
        ...packageInfo,
        appName,
        appNumber
    };
}

export async function getWidgetPackageInfo(path: string): Promise<WidgetInfo> {
    const info = await getPackageInfo(path);
    return {
        ...info,
        widgetName: ensureString(info.widgetName, "widgetName"),
        changelog: WidgetChangelogFileWrapper.fromFile(`${path}/CHANGELOG.md`)
    };
}

export async function getModulePackageInfo(path: string): Promise<ModuleInfo> {
    const content = await getPackageFileContent(path);
    const { testProject } = content;
    const info = await getPackageInfo(path);

    return {
        ...info,
        moduleNameInModeler: ensureString(content.moduleNameInModeler, "moduleNameInModeler"),
        moduleFolderNameInModeler: ensureString(content.moduleFolderNameInModeler, "moduleFolderNameInModeler"),
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

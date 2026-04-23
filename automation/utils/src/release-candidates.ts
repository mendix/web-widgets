import { join } from "path";
import {
    getWidgetChangelog,
    getModuleChangelog,
    WidgetChangelogFileWrapper,
    ModuleChangelogFileWrapper
} from "./changelog-parser";
import { FileSystem, defaultFS } from "./io/filesystem";
import { getPackageInfo, getWidgetInfo, getModuleInfo, PackageInfo } from "./package-info";

/**
 * Represents a single changelog entry
 */
export interface ChangelogEntry {
    type: "Fixed" | "Added" | "Changed" | "Removed";
    description: string;
}

/**
 * Release information for a dependent widget
 */
export interface DependentWidgetInfo {
    name: string;
    path: string;
    currentVersion: string;
    appName: string;
    hasUnreleasedChanges: boolean;
    unreleasedEntries: ChangelogEntry[];
}

/**
 * Release candidate - represents any package that can be released
 */
export interface ReleaseCandidate {
    packageType: "widget" | "module";
    hasDependencies: boolean;
    name: string;
    path: string;
    currentVersion: string;
    appNumber: number;
    appName: string;
    hasUnreleasedChanges: boolean;
    unreleasedEntries: ChangelogEntry[];
    dependentWidgets?: DependentWidgetInfo[]; // Only present if hasDependencies is true
}

/**
 * Check if a package is an aggregator (has dependencies and appNumber)
 */
function isAggregator(info: PackageInfo): boolean {
    return !!info.marketplace.appNumber && info.mxpackage.dependencies && info.mxpackage.dependencies.length > 0;
}

/**
 * Check if a package is independent widget (has appNumber, no dependencies, is a widget)
 */
function isIndependentWidget(info: PackageInfo): boolean {
    return (
        !!info.marketplace.appNumber &&
        (!info.mxpackage.dependencies || info.mxpackage.dependencies.length === 0) &&
        info.mxpackage.type === "widget"
    );
}

/**
 * Check if a package is a standalone module (has appNumber, no dependencies, is a module)
 * Example: web-actions (just JavaScript actions, no widgets)
 */
function isStandaloneModule(info: PackageInfo): boolean {
    return (
        !!info.marketplace.appNumber &&
        (!info.mxpackage.dependencies || info.mxpackage.dependencies.length === 0) &&
        info.mxpackage.type === "module"
    );
}

/**
 * Extract simple changelog entries from changelog wrapper
 */
export function extractChangelogEntries(
    changelog: WidgetChangelogFileWrapper | ModuleChangelogFileWrapper
): ChangelogEntry[] {
    const unreleased = changelog.changelog.content[0];
    return unreleased.sections.flatMap(section =>
        section.logs.map(log => ({
            type: section.type,
            description: log
        }))
    );
}

/**
 * Load dependent widget info
 * Note: Some "widgets" might actually be other types (e.g., jsactions)
 * We need to check the package type first
 */
async function loadDependentWidgetInfo(path: string): Promise<DependentWidgetInfo> {
    const basicInfo = await getPackageInfo(path);

    // Only process actual widgets
    if (basicInfo.mxpackage.type !== "widget") {
        throw new Error(`Package ${basicInfo.name} is not a widget (type: ${basicInfo.mxpackage.type})`);
    }

    const info = await getWidgetInfo(path);
    const changelog = await getWidgetChangelog(path);
    const hasUnreleasedChanges = changelog.hasUnreleasedLogs();
    const unreleasedEntries = hasUnreleasedChanges ? extractChangelogEntries(changelog) : [];

    return {
        name: info.name,
        path,
        currentVersion: info.version.format(),
        appName: info.marketplace.appName ?? info.mxpackage.name,
        hasUnreleasedChanges,
        unreleasedEntries
    };
}

/**
 * Scan a directory for packages
 */
async function scanPackagesDirectory(dirPath: string, fs: FileSystem = defaultFS): Promise<string[]> {
    try {
        const exists = await fs.exists(dirPath);
        if (!exists) return [];

        const entries = await fs.readdir(dirPath);
        const packagePaths: string[] = [];

        for (const entry of entries) {
            const fullPath = join(dirPath, entry);
            const packageJsonPath = join(fullPath, "package.json");
            const hasPackageJson = await fs.exists(packageJsonPath);

            if (hasPackageJson) {
                packagePaths.push(fullPath);
            }
        }

        return packagePaths;
    } catch (error) {
        console.warn(`Warning: Could not scan directory ${dirPath}:`, error);
        return [];
    }
}

/**
 * Load release candidates (packages with unreleased changes)
 * @param rootPath - Root path of the monorepo (defaults to cwd)
 * @param fs - Filesystem implementation (defaults to Node.js fs)
 * @returns Array of release candidates that have unreleased changes
 */
export async function loadReleaseCandidates(
    rootPath: string = process.cwd(),
    fs: FileSystem = defaultFS
): Promise<ReleaseCandidate[]> {
    // Load all packages first
    const allPackages = await loadAllPackages(rootPath, fs);

    // Filter to only those with unreleased changes
    return allPackages.filter(pkg => {
        if (pkg.hasDependencies) {
            // For packages with dependencies, check if package itself OR any dependent has changes
            return pkg.hasUnreleasedChanges || pkg.dependentWidgets!.some(w => w.hasUnreleasedChanges);
        } else {
            // For independent packages, just check the package itself
            return pkg.hasUnreleasedChanges;
        }
    });
}

/**
 * Load all packages (including those without unreleased changes)
 * Loads all releasable packages from the monorepo
 * @param rootPath - Root path of the monorepo (defaults to cwd)
 * @param fs - Filesystem implementation (defaults to Node.js fs)
 * @returns Array of all release candidates
 */
export async function loadAllPackages(
    rootPath: string = process.cwd(),
    fs: FileSystem = defaultFS
): Promise<ReleaseCandidate[]> {
    const candidates: ReleaseCandidate[] = [];

    // Scan pluggableWidgets directory
    const widgetsDir = join(rootPath, "packages", "pluggableWidgets");
    const widgetPaths = await scanPackagesDirectory(widgetsDir, fs);

    // Scan modules directory
    const modulesDir = join(rootPath, "packages", "modules");
    const modulePaths = await scanPackagesDirectory(modulesDir, fs);

    // Track dependent widgets to skip them in the first pass
    const dependentWidgets = new Set<string>();

    // First pass: identify all packages and their relationships
    const allPackages = new Map<string, { path: string; info: PackageInfo }>();

    for (const path of [...widgetPaths, ...modulePaths]) {
        try {
            const info = await getPackageInfo(path);
            allPackages.set(info.name, { path, info });

            // If this is an aggregator, mark its dependencies
            if (isAggregator(info)) {
                info.mxpackage.dependencies.forEach(dep => dependentWidgets.add(dep));
            }
        } catch (error) {
            console.warn(`Warning: Could not load package info for ${path}:`, error);
        }
    }

    // Second pass: process all packages (no filtering here)
    for (const [name, { path, info }] of allPackages.entries()) {
        try {
            if (isAggregator(info)) {
                // Package with dependencies (module or widget aggregator)
                const packageType = info.mxpackage.type as "widget" | "module";

                // Load changelog (both use module format)
                const changelog = await getModuleChangelog(path, info.mxpackage.name);
                const hasOwnChanges = changelog.hasUnreleasedLogs();
                const ownEntries = hasOwnChanges ? extractChangelogEntries(changelog) : [];

                // Load dependent widgets
                const dependentWidgetInfos: DependentWidgetInfo[] = [];
                for (const depName of info.mxpackage.dependencies) {
                    const depPackage = allPackages.get(depName);
                    if (depPackage) {
                        try {
                            const depInfo = await loadDependentWidgetInfo(depPackage.path);
                            dependentWidgetInfos.push(depInfo);
                        } catch (error) {
                            console.warn(`Warning: Could not load dependent widget ${depName}:`, error);
                        }
                    }
                }

                candidates.push({
                    packageType,
                    hasDependencies: true,
                    name: info.name,
                    path,
                    currentVersion: info.version.format(),
                    appNumber: info.marketplace.appNumber!,
                    appName: info.marketplace.appName ?? info.mxpackage.name,
                    hasUnreleasedChanges: hasOwnChanges,
                    unreleasedEntries: ownEntries,
                    dependentWidgets: dependentWidgetInfos
                });
            } else if (isIndependentWidget(info) && !dependentWidgets.has(name)) {
                // Independent widget (no dependencies)
                const widgetInfo = await getWidgetInfo(path);
                const changelog = await getWidgetChangelog(path);
                const hasUnreleasedChanges = changelog.hasUnreleasedLogs();
                const unreleasedEntries = hasUnreleasedChanges ? extractChangelogEntries(changelog) : [];

                candidates.push({
                    packageType: "widget",
                    hasDependencies: false,
                    name: info.name,
                    path,
                    currentVersion: widgetInfo.version.format(),
                    appNumber: info.marketplace.appNumber!,
                    appName: info.marketplace.appName ?? info.mxpackage.name,
                    hasUnreleasedChanges,
                    unreleasedEntries
                });
            } else if (isStandaloneModule(info)) {
                // Standalone module (no dependencies)
                const moduleInfo = await getModuleInfo(path);
                const changelog = await getModuleChangelog(path, info.mxpackage.name);
                const hasUnreleasedChanges = changelog.hasUnreleasedLogs();
                const unreleasedEntries = hasUnreleasedChanges ? extractChangelogEntries(changelog) : [];

                candidates.push({
                    packageType: "module",
                    hasDependencies: false,
                    name: info.name,
                    path,
                    currentVersion: moduleInfo.version.format(),
                    appNumber: info.marketplace.appNumber!,
                    appName: info.marketplace.appName ?? info.mxpackage.name,
                    hasUnreleasedChanges,
                    unreleasedEntries
                });
            }
            // Skip dependent widgets - they're handled as part of aggregators
        } catch (error) {
            console.warn(`Warning: Could not process package ${name}:`, error);
        }
    }

    return candidates;
}

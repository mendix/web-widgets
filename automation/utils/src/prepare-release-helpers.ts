import { getModuleInfo, getWidgetInfo, ModuleInfo, WidgetInfo } from "./package-info";
import {
    getModuleChangelog,
    getWidgetChangelog,
    ModuleChangelogFileWrapper,
    WidgetChangelogFileWrapper
} from "./changelog-parser";
import { listPackages, PackageListing } from "./monorepo";
import chalk from "chalk";

import { prompt } from "enquirer";

type WidgetPkg = {
    type: "widget";
    info: WidgetInfo;
    path: string;
    changelog: WidgetChangelogFileWrapper;
};

type ModulePkg = {
    type: "module";
    info: ModuleInfo;
    path: string;
    changelog: ModuleChangelogFileWrapper;
    widgets: WidgetPkg[];
};

type PackagesTree = Array<WidgetPkg | ModulePkg>;
type PackagesFullInfo =
    | [PackageListing, WidgetInfo, WidgetChangelogFileWrapper]
    | [PackageListing, ModuleInfo, ModuleChangelogFileWrapper];
type PackagesFullInfoList = PackagesFullInfo[];
type PackagesFullInfoMap = Map<string, PackagesFullInfo>;

async function loadPackagesFullInfo(packages: PackageListing[]): Promise<PackagesFullInfoList> {
    const results: PackagesFullInfoList = [];
    for (const pkg of packages) {
        if (pkg.path.includes("/pluggableWidgets/")) {
            try {
                const widgetInfo = await getWidgetInfo(pkg.path);
                const changelog = await getWidgetChangelog(pkg.path);
                results.push([pkg, widgetInfo, changelog]);
            } catch (_e) {
                // ignore or log error
            }
        } else if (pkg.path.includes("/modules/")) {
            try {
                const moduleInfo = await getModuleInfo(pkg.path);
                const changelog = await getModuleChangelog(pkg.path, moduleInfo.mxpackage.name);
                results.push([pkg, moduleInfo, changelog]);
            } catch (_e) {
                // ignore or log error
            }
        }
    }
    return results;
}

function createPackagesMap(pkgs: PackagesFullInfoList): PackagesFullInfoMap {
    const map: PackagesFullInfoMap = new Map();

    pkgs.forEach(pkg => {
        map.set(pkg[0].name, pkg);
    });

    return map;
}

function createPackagesTree(map: PackagesFullInfoMap, list: PackagesFullInfoList): PackagesTree {
    const tree: PackagesTree = [];
    list.forEach(([pkg, info, changelog]) => {
        if (!info.marketplace.appNumber) {
            // for packages without marketplace number - skip, those are dependents on modules
            return;
        }

        if (info.mxpackage.type === "widget") {
            tree.push({
                type: "widget",
                info: info as WidgetInfo,
                path: pkg.path,
                changelog: changelog as WidgetChangelogFileWrapper
            });
        } else {
            tree.push({
                type: "module",
                info: info as ModuleInfo,
                path: pkg.path,
                changelog: changelog as ModuleChangelogFileWrapper,
                widgets: (info as ModuleInfo).mxpackage.dependencies.map(d => {
                    const r = map.get(d);
                    if (!r) {
                        throw new Error("dep not found");
                    }
                    return {
                        type: "widget",
                        info: r[1] as WidgetInfo,
                        path: r[0].path,
                        changelog: r[2] as WidgetChangelogFileWrapper
                    };
                })
            });
        }
    });

    return tree;
}

export async function selectPackageV2(): Promise<WidgetPkg | ModulePkg> {
    const pkgs = await listPackages(["'*'", "!web-widgets"]);
    const pkgsList = await loadPackagesFullInfo(pkgs);
    const pkgsMap = createPackagesMap(pkgsList);
    const pkgsTree = createPackagesTree(pkgsMap, pkgsList);

    const displayData = pkgsTree.map(pkg => {
        const category = pkg.info.mxpackage.type;
        const displayName = pkg.info.mxpackage.name;

        const categoryInfo = `[${category}]`;
        const hasChangelogs =
            pkg.changelog.hasUnreleasedLogs() ||
            (pkg.type === "module" && pkg.widgets.some(w => w.changelog.hasUnreleasedLogs()));

        return {
            displayName,
            categoryInfo,
            hasChangelogs,
            packageName: pkg.info.name
        };
    });

    // Find maximum display name length for padding
    const maxDisplayNameLength = Math.max(...displayData.map(item => item.displayName.length));

    const { packageName } = await prompt<{ packageName: string }>({
        type: "autocomplete",
        name: "packageName",
        message: "Please select package",
        choices: displayData.map(item => {
            // Pad the display name with spaces to align the category info
            return {
                name: `${item.displayName.padEnd(maxDisplayNameLength + 2, " ")}${item.categoryInfo}${item.hasChangelogs ? "🆕" : ""}`,
                value: item.packageName
            };
        })
    });

    return pkgsTree.find(p => p.info.name === packageName)!;
}

const PADDING = 60;
export function printPkgInformation(pkg: WidgetPkg | ModulePkg): void {
    console.log(
        `${shortName(pkg.info.name).padEnd(PADDING + 3, " ")} ${chalk.bold(pkg.info.version.format())} ${pkg.changelog.hasUnreleasedLogs() ? "🆕" : " "}`
    );
    if (pkg.type === "module") {
        pkg.widgets.forEach((widget, i) => {
            const isLast = i === pkg.widgets.length - 1;
            console.log(
                `${isLast ? "└" : "├"}─ ${shortName(widget.info.name).padEnd(PADDING, " ")} ${chalk.dim(widget.info.version.format())} ${widget.changelog.hasUnreleasedLogs() ? "🆕" : ""}`
            );
        });
    }
}

function shortName(fullName: string): string {
    return fullName.split("/")[1]!;
}

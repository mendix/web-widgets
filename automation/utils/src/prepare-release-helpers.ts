import { getModuleInfo, getPackageInfo, getWidgetInfo, ModuleInfo, WidgetInfo } from "./package-info";
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
    changelog: WidgetChangelogFileWrapper | ModuleChangelogFileWrapper;
    widgets: WidgetPkg[];
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
        const normalizedPath = pkg.path.replace(/\\/g, "/");
        if (normalizedPath.includes("/pluggableWidgets/") || normalizedPath.includes("/modules/")) {
            const basicInfo = await getPackageInfo(pkg.path);

            if (basicInfo.mxpackage.type === "widget") {
                try {
                    const widgetInfo = await getWidgetInfo(pkg.path);
                    let changelog: WidgetChangelogFileWrapper | ModuleChangelogFileWrapper;
                    if (basicInfo.mxpackage.changelogType === "widget") {
                        changelog = await getWidgetChangelog(pkg.path);
                    } else {
                        changelog = await getModuleChangelog(pkg.path, basicInfo.mxpackage.name);
                    }

                    results.push([pkg, widgetInfo, changelog]);
                } catch (_e) {
                    // ignore or log error
                }
            } else if (basicInfo.mxpackage.type === "module") {
                try {
                    const moduleInfo = await getModuleInfo(pkg.path);
                    const changelog = await getModuleChangelog(pkg.path, moduleInfo.mxpackage.name);
                    results.push([pkg, moduleInfo, changelog]);
                } catch (_e) {
                    // ignore or log error
                }
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

        const dependencies = info.mxpackage.dependencies.length
            ? info.mxpackage.dependencies.map(d => {
                  const r = map.get(d);
                  if (!r) {
                      throw new Error("dep not found");
                  }
                  return {
                      type: "widget",
                      info: r[1] as WidgetInfo,
                      path: r[0].path,
                      changelog: r[2] as WidgetChangelogFileWrapper
                  } as WidgetPkg;
              })
            : [];

        if (info.mxpackage.type === "widget") {
            tree.push({
                type: "widget",
                info: info as WidgetInfo,
                path: pkg.path,
                changelog,
                widgets: dependencies
            });
        } else {
            tree.push({
                type: "module",
                info: info as ModuleInfo,
                path: pkg.path,
                changelog: changelog as ModuleChangelogFileWrapper,
                widgets: dependencies
            });
        }
    });

    return tree;
}

export async function selectPackageV2(): Promise<WidgetPkg | ModulePkg> {
    const pkgs = await listPackages(['"*"', '"!web-widgets"']);
    const pkgsList = await loadPackagesFullInfo(pkgs);
    const pkgsMap = createPackagesMap(pkgsList);
    const pkgsTree = createPackagesTree(pkgsMap, pkgsList);

    const displayData = pkgsTree.map(pkg => {
        const category = pkg.info.mxpackage.type;
        const displayName = pkg.info.mxpackage.name;

        const categoryInfo = `[${category}]`;
        const hasChangelogs =
            pkg.changelog.hasUnreleasedLogs() || pkg.widgets.some(w => w.changelog.hasUnreleasedLogs());

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
// eslint-disable-next-line no-control-regex
const ANSI_RE = /\x1B\[[0-9;]*m/g;
const visibleLen = (s: string): number => s.replace(ANSI_RE, "").length;

function wrapLine(line: string, maxLen: number): string[] {
    if (maxLen <= 0) return [line];
    const result: string[] = [];
    let remaining = line;
    while (remaining.length > maxLen) {
        result.push(remaining.slice(0, maxLen));
        remaining = remaining.slice(maxLen);
    }
    result.push(remaining);
    return result;
}

function printSectionBox(type: string, logs: string[], treePrefix: string, boxWidth: number): void {
    const headerInner = `─ ${type} `;
    const topDashes = "─".repeat(Math.max(0, boxWidth - 2 - headerInner.length));
    console.log(`${treePrefix}${chalk.dim(`┌${headerInner}${topDashes}┐`)}`);
    const contentWidth = boxWidth - 4; // subtract "│ " left and " │" right
    for (const log of logs) {
        for (const wrappedLine of wrapLine(log, contentWidth)) {
            console.log(`${treePrefix}${chalk.dim("│")} ${wrappedLine.padEnd(contentWidth)} ${chalk.dim("│")}`);
        }
    }
    console.log(`${treePrefix}${chalk.dim(`└${"─".repeat(Math.max(0, boxWidth - 2))}┘`)}`);
}

function printUnreleasedChangelog(
    changelog: WidgetChangelogFileWrapper | ModuleChangelogFileWrapper,
    treePrefix: string
): void {
    const unreleased = changelog.changelog.content[0];
    const subcomponents = "subcomponents" in unreleased ? unreleased.subcomponents : [];

    const termWidth = process.stdout.columns || 100;
    const boxWidth = Math.max(20, termWidth - visibleLen(treePrefix));

    for (const section of unreleased.sections) {
        if (section.logs.length === 0) continue;
        printSectionBox(
            section.type,
            section.logs.map(l => `- ${l}`),
            treePrefix,
            boxWidth
        );
    }

    for (const sub of subcomponents) {
        const label = "version" in sub ? `${sub.name} [${sub.version.format()}]` : sub.name;
        console.log(`${treePrefix}${chalk.yellow(label)}`);
        for (const section of sub.sections) {
            if (section.logs.length === 0) continue;
            printSectionBox(
                section.type,
                section.logs.map(l => `- ${l}`),
                `${treePrefix}  `,
                Math.max(20, boxWidth - 2)
            );
        }
    }
}

export function printPkgInformation(pkg: WidgetPkg | ModulePkg): void {
    console.log(
        `${shortName(pkg.info.name).padEnd(PADDING + 3, " ")} ${chalk.bold(pkg.info.version.format())} ${pkg.changelog.hasUnreleasedLogs() ? "🆕" : " "}`
    );
    if (pkg.changelog.hasUnreleasedLogs()) {
        printUnreleasedChangelog(pkg.changelog, "  ");
    }
    if (pkg.widgets.length) {
        pkg.widgets.forEach((widget, i) => {
            const isLast = i === pkg.widgets.length - 1;
            console.log(
                `${isLast ? "└" : "├"}─ ${shortName(widget.info.name).padEnd(PADDING, " ")} ${chalk.dim(widget.info.version.format())} ${widget.changelog.hasUnreleasedLogs() ? "🆕" : ""}`
            );
            if (widget.changelog.hasUnreleasedLogs()) {
                printUnreleasedChangelog(widget.changelog, isLast ? "   " : "│  ");
            }
        });
    }
}

function shortName(fullName: string): string {
    return fullName.split("/")[1]!;
}

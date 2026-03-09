import { readFileSync } from "fs";
import { resolve } from "path";
import type { WidgetPackageJson } from "../types";

export function readWidgetPackageJson(): WidgetPackageJson {
    const packageJsonPath = resolve(process.cwd(), "package.json");
    const packageJsonText = readFileSync(packageJsonPath, "utf-8");
    return JSON.parse(packageJsonText) as WidgetPackageJson;
}

export function toPackagePathDir(packagePath: string): string {
    return packagePath.replace(/\./g, "/");
}

export function resolveWidgetName(
    optionsWidgetName: string | undefined,
    packageWidgetName: string | undefined
): string {
    const widgetName = optionsWidgetName ?? packageWidgetName;

    if (!widgetName) {
        throw new Error(
            "Widget name is missing. Pass `widgetName` to createWidgetViteConfig() or add `widgetName` to package.json."
        );
    }

    return widgetName;
}

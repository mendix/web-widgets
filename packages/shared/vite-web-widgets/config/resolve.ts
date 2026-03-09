import { resolve } from "path";
import type { ResolvedConfig, WidgetViteConfigOptions } from "../types";
import { readWidgetPackageJson, resolveWidgetName } from "../helpers/package-json";
import {
    inferEditorBuilds,
    inferMetadataFiles,
    inferPrimaryRuntimeFormat,
    inferRemoveBeforeCopy,
    inferRequiredArtifacts,
    inferRuntimeOutDir
} from "./infer";

export function getResolveAlias(): { find: RegExp; replacement: string }[] {
    return [
        {
            find: /^~(.+)/,
            replacement: "$1"
        },
        {
            find: /^src\//,
            replacement: `${resolve(process.cwd(), "src")}/`
        }
    ];
}

export function isBuildDev(mode: string): boolean {
    return mode === "dev";
}

export function resolveConfig(options: WidgetViteConfigOptions, isDev: boolean = false): ResolvedConfig {
    const widgetPackageJson = readWidgetPackageJson();
    const widgetName = resolveWidgetName(options.widgetName, widgetPackageJson.widgetName);
    const primaryRuntimeFormat = inferPrimaryRuntimeFormat();
    const editorBuilds = inferEditorBuilds(widgetName);
    const runtimeDirectoryName = options.runtimeDirectoryName ?? widgetName.toLowerCase();

    return {
        widgetName,
        widgetVersion: widgetPackageJson.version,
        mpkName: widgetPackageJson.mxpackage?.mpkName ?? `${widgetName}.mpk`,
        runtimeEntry: `src/${widgetName}.tsx`,
        runtimeOutDir: inferRuntimeOutDir(widgetPackageJson.packagePath, runtimeDirectoryName),
        runtimeOutputs: [
            {
                format: primaryRuntimeFormat,
                entryFileName: `${widgetName}.js`
            },
            {
                format: "es",
                entryFileName: `${widgetName}.mjs`
            }
        ],
        runtimeExternals: ["react", "react-dom", "@mendix/widget-plugin-component-kit", "big.js", /^mendix($|\/)/],
        metadataFiles: inferMetadataFiles(widgetName),
        editorBuilds,
        requiredArtifacts: inferRequiredArtifacts(
            widgetName,
            widgetPackageJson.packagePath,
            runtimeDirectoryName,
            editorBuilds
        ),
        removeBeforeCopy: inferRemoveBeforeCopy(widgetPackageJson.name),
        define: {
            "process.env.NODE_ENV": JSON.stringify(isDev ? "development" : "production")
        }
    };
}

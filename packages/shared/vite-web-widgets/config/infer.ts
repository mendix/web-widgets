import { existsSync } from "fs";
import type { EditorBuild, FileCopy } from "../types";
import { toPackagePathDir } from "../helpers/package-json";

export function inferPrimaryRuntimeFormat(): "cjs" | "amd" {
    if (process.env.VITE_RUNTIME_FORMAT === "cjs") {
        return "cjs";
    }

    return "amd";
}

export function inferMetadataFiles(widgetName: string): FileCopy[] {
    return [
        { src: `src/${widgetName}.xml`, dest: `${widgetName}.xml` },
        { src: `src/${widgetName}.icon.png`, dest: `${widgetName}.icon.png` },
        { src: `src/${widgetName}.icon.dark.png`, dest: `${widgetName}.icon.dark.png` },
        { src: `src/${widgetName}.tile.png`, dest: `${widgetName}.tile.png` },
        { src: `src/${widgetName}.tile.dark.png`, dest: `${widgetName}.tile.dark.png` },
        { src: "../../../LICENSE", dest: "License.txt" },
        { src: "src/package.xml", dest: "package.xml" }
    ];
}

export function inferRequiredArtifacts(
    widgetName: string,
    packagePath: string,
    runtimeDirectoryName: string,
    editorBuilds: EditorBuild[]
): string[] {
    const packagePathDir = toPackagePathDir(packagePath);
    const widgetDir = runtimeDirectoryName;

    const editorArtifacts = editorBuilds.map(editorBuild => editorBuild.outputFile);

    return [
        ...editorArtifacts,
        `${packagePathDir}/${widgetDir}/${widgetName}.js`,
        `${packagePathDir}/${widgetDir}/${widgetName}.mjs`
    ];
}

export function inferRuntimeOutDir(packagePath: string, runtimeDirectoryName: string): string {
    const packagePathDir = toPackagePathDir(packagePath);
    return `dist/tmp/widgets/${packagePathDir}/${runtimeDirectoryName}`;
}

export function inferEditorBuilds(widgetName: string): EditorBuild[] {
    const editorBuilds: EditorBuild[] = [];

    const editorPreviewEntry = `src/${widgetName}.editorPreview.tsx`;
    if (existsSync(editorPreviewEntry)) {
        editorBuilds.push({
            entry: editorPreviewEntry,
            outputFile: `${widgetName}.editorPreview.js`,
            externals: [/^mendix($|\/)/, /^react$/, /^react-dom$/]
        });
    }

    const editorConfigEntry = `src/${widgetName}.editorConfig.ts`;
    if (existsSync(editorConfigEntry)) {
        editorBuilds.push({
            entry: editorConfigEntry,
            outputFile: `${widgetName}.editorConfig.js`,
            externals: [/^mendix($|\/)/, /^react$/, /^react-dom$/]
        });
    }

    return editorBuilds;
}

export function inferRemoveBeforeCopy(packageName: string): string[] {
    const widgetPackageName = packageName.split("/").pop();
    return widgetPackageName ? [`${widgetPackageName}.css`] : [];
}

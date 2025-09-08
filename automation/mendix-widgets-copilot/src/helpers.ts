import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { XMLParser } from "fast-xml-parser";
import type { PackageInfo, WidgetInspection } from "./types.js";

export function extractMpkName(scripts: Record<string, string> = {}): string | undefined {
    // Look for MPKOUTPUT in build scripts
    for (const script of Object.values(scripts)) {
        const match = script.match(/MPKOUTPUT=([^\s]+)/);
        if (match) return match[1];
    }
    return undefined;
}

export async function getWidgetName(packagePath: string): Promise<string | null> {
    try {
        const pkgRaw = await readFile(join(packagePath, "package.json"), "utf-8");
        const pkg = JSON.parse(pkgRaw);
        if (typeof pkg.widgetName === "string" && pkg.widgetName.trim()) {
            return pkg.widgetName.trim();
        }
    } catch {
        // ignore
    }
    const parts = packagePath.split("/");
    return parts[parts.length - 1].split("-")[0] || null;
}

export async function resolveWidgetFiles(packagePath: string): Promise<{
    widgetName: string | null;
    srcPath: string;
    widgetXmlPath?: string;
    editorConfigPath?: string;
    editorPreviewPath?: string;
}> {
    const srcPath = join(packagePath, "src");
    const widgetName = await getWidgetName(packagePath);
    let widgetXmlPath: string | undefined;
    let editorConfigPath: string | undefined;
    let editorPreviewPath: string | undefined;

    try {
        const files = await readdir(srcPath);

        if (widgetName) {
            const xmlCandidate = `${widgetName}.xml`;
            if (files.includes(xmlCandidate)) widgetXmlPath = join(srcPath, xmlCandidate);

            const cfgCandidate = `${widgetName}.editorConfig.ts`;
            if (files.includes(cfgCandidate)) editorConfigPath = join(srcPath, cfgCandidate);

            const prevCandidate = `${widgetName}.editorPreview.tsx`;
            if (files.includes(prevCandidate)) editorPreviewPath = join(srcPath, prevCandidate);
        }

        // Fallbacks
        if (!widgetXmlPath) {
            const anyXml = files.find(f => f.endsWith(".xml") && !f.includes("package"));
            if (anyXml) widgetXmlPath = join(srcPath, anyXml);
        }
        if (!editorConfigPath) {
            const anyCfg = files.find(f => f.includes("editorConfig"));
            if (anyCfg) editorConfigPath = join(srcPath, anyCfg);
        }
        if (!editorPreviewPath) {
            const anyPrev = files.find(f => f.includes("editorPreview"));
            if (anyPrev) editorPreviewPath = join(srcPath, anyPrev);
        }
    } catch {
        // ignore; caller will handle errors
    }

    return { widgetName, srcPath, widgetXmlPath, editorConfigPath, editorPreviewPath };
}

export async function scanPackages(packagesDir: string): Promise<PackageInfo[]> {
    const packages: PackageInfo[] = [];

    try {
        const categories = await readdir(packagesDir);

        for (const category of categories) {
            const categoryPath = join(packagesDir, category);

            try {
                const packageDirs = await readdir(categoryPath, { withFileTypes: true });

                for (const packageDir of packageDirs) {
                    if (!packageDir.isDirectory()) continue;

                    const packagePath = join(categoryPath, packageDir.name);
                    const packageJsonPath = join(packagePath, "package.json");

                    try {
                        const packageJsonContent = await readFile(packageJsonPath, "utf-8");
                        const packageJson = JSON.parse(packageJsonContent);

                        const kind =
                            category === "pluggableWidgets"
                                ? "pluggableWidget"
                                : category === "customWidgets"
                                  ? "customWidget"
                                  : "module";

                        packages.push({
                            name: packageJson.name || packageDir.name,
                            path: packagePath,
                            kind,
                            version: packageJson.version || "unknown",
                            mpkName: extractMpkName(packageJson.scripts),
                            scripts: packageJson.scripts || {},
                            dependencies: packageJson.dependencies ? Object.keys(packageJson.dependencies) : []
                        });
                    } catch (error) {
                        // Skip packages without valid package.json
                        console.warn(`Skipping ${packagePath}: ${error}`);
                    }
                }
            } catch (error) {
                console.warn(`Skipping category ${category}: ${error}`);
            }
        }
    } catch (error) {
        console.error(`Error scanning packages: ${error}`);
    }

    return packages;
}

export async function inspectWidget(packagePath: string): Promise<WidgetInspection> {
    const inspection: WidgetInspection = {
        packageInfo: {} as PackageInfo,
        runtimeFiles: [],
        testFiles: [],
        errors: []
    };

    try {
        // Get package info
        const packageJsonPath = join(packagePath, "package.json");
        const packageJsonContent = await readFile(packageJsonPath, "utf-8");
        const packageJson = JSON.parse(packageJsonContent);

        const pathParts = packagePath.split("/");
        const category = pathParts[pathParts.length - 2];
        const kind =
            category === "pluggableWidgets"
                ? "pluggableWidget"
                : category === "customWidgets"
                  ? "customWidget"
                  : "module";

        inspection.packageInfo = {
            name: packageJson.name || pathParts[pathParts.length - 1],
            path: packagePath,
            kind,
            version: packageJson.version || "unknown",
            mpkName: extractMpkName(packageJson.scripts),
            scripts: packageJson.scripts || {},
            dependencies: packageJson.dependencies ? Object.keys(packageJson.dependencies) : []
        };

        // Parse XML files
        const parser = new XMLParser({ ignoreAttributes: false });

        // Look for widget XML in src/ using central resolution
        const srcPath = join(packagePath, "src");
        try {
            const resolved = await resolveWidgetFiles(packagePath);
            if (resolved.widgetXmlPath) {
                const xmlContent = await readFile(resolved.widgetXmlPath, "utf-8");
                inspection.widgetXml = parser.parse(xmlContent);
                inspection.widgetXmlPath = resolved.widgetXmlPath;
            }
        } catch (err) {
            inspection.errors.push(`Could not read src directory: ${err}`);
        }

        // Parse package.xml
        try {
            const packageXmlPath = join(srcPath, "package.xml");
            const packageXmlContent = await readFile(packageXmlPath, "utf-8");
            inspection.packageXml = parser.parse(packageXmlContent);
        } catch (err) {
            inspection.errors.push(`Could not read package.xml: ${err}`);
        }

        // Find editor config and preview based on central resolution
        try {
            const resolved = await resolveWidgetFiles(packagePath);
            if (resolved.editorConfigPath) inspection.editorConfig = resolved.editorConfigPath;
            if (resolved.editorPreviewPath) inspection.editorPreview = resolved.editorPreviewPath;
        } catch (err) {
            inspection.errors.push(`Could not find editor config: ${err}`);
        }

        // Find runtime files
        try {
            const srcFiles = await readdir(srcPath);
            inspection.runtimeFiles = srcFiles
                .filter(file => file.endsWith(".tsx") || file.endsWith(".ts"))
                .map(file => join(srcPath, file));
        } catch (err) {
            inspection.errors.push(`Could not scan runtime files: ${err}`);
        }

        // Find test files
        try {
            const testPaths = [
                join(packagePath, "src", "__tests__"),
                join(packagePath, "tests"),
                join(packagePath, "e2e")
            ];

            for (const testPath of testPaths) {
                try {
                    const testFiles = await readdir(testPath, { recursive: true });
                    inspection.testFiles.push(...testFiles.map(file => join(testPath, file)));
                } catch {
                    // Directory doesn't exist, continue
                }
            }
        } catch (err) {
            inspection.errors.push(`Could not scan test files: ${err}`);
        }
    } catch (err) {
        inspection.errors.push(`Failed to inspect package: ${err}`);
    }

    return inspection;
}

export function determineBuildCommand(scripts: Record<string, string>): string {
    if (scripts.build) {
        return `pnpm ${scripts.build.startsWith("pnpm ") ? scripts.build.slice(5) : "build"}`;
    } else if (scripts["build:web"]) {
        return "pnpm build:web";
    } else if (scripts["build:ts"]) {
        return "pnpm build:ts";
    }
    return "pnpm build";
}

export function determineTestCommand(scripts: Record<string, string>, kind?: string): string {
    if (kind === "unit" && scripts["test:unit"]) {
        return "pnpm test:unit";
    } else if (kind === "e2e" && scripts["test:e2e"]) {
        return "pnpm test:e2e";
    } else if (scripts.test) {
        return "pnpm test";
    } else {
        throw new Error("No test script found in package.json");
    }
}

export function formatCommandResult(
    success: boolean,
    command?: string,
    stdout?: string,
    stderr?: string,
    error?: unknown
) {
    if (success) {
        return {
            success: true,
            command,
            stdout: stdout?.slice(-1000), // Last 1000 chars
            stderr: stderr ? stderr.slice(-500) : null
        };
    } else {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

import { execSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { tmpdir } from "node:os";

export interface MpkFileEntry {
    path: string;
    sizeBytes: number;
}

export interface PackageXmlInfo {
    clientModuleName?: string;
    version?: string;
    widgetFilePath?: string;
    filesPath?: string;
    raw: string;
}

export interface WidgetXmlInfo {
    id?: string;
    pluginWidget?: boolean;
    needsEntityContext?: boolean;
    propertyCount: number;
    raw: string;
}

export interface BundleInfo {
    fileName: string;
    sizeBytes: number;
    format: "amd" | "esm" | "unknown";
    hasUseStrict: boolean;
    exportPattern: string[];
    containsDefine: boolean;
    containsExportDefault: boolean;
    containsExportNamed: boolean;
}

export interface MpkAnalysis {
    mpkPath: string;
    mpkSizeBytes: number;
    files: MpkFileEntry[];
    packageXml?: PackageXmlInfo;
    widgetXml?: WidgetXmlInfo;
    bundle?: BundleInfo;
    errors: string[];
}

/**
 * Analyzes an .mpk file (ZIP archive) and returns structural findings.
 * Unzips to a temp directory, reads package.xml, widget XML, and the JS bundle.
 * No new dependencies — uses the macOS/Linux `unzip` command.
 */
export function analyzeMpk(mpkPath: string): MpkAnalysis {
    const errors: string[] = [];

    if (!existsSync(mpkPath)) {
        return {
            mpkPath,
            mpkSizeBytes: 0,
            files: [],
            errors: [`File not found: ${mpkPath}`]
        };
    }

    const mpkSizeBytes = statSync(mpkPath).size;
    const tempDir = mkdtempSync(join(tmpdir(), "mpk-analyze-"));

    try {
        // Unzip to temp directory
        try {
            execSync(`unzip -q "${mpkPath}" -d "${tempDir}"`, { timeout: 30000 });
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            errors.push(`unzip failed: ${msg}`);
            return { mpkPath, mpkSizeBytes, files: [], errors };
        }

        // Catalog all files
        const files = catalogFiles(tempDir, tempDir);

        // Parse package.xml
        const packageXml = parsePackageXml(tempDir, errors);

        // Find and parse widget XML
        const widgetXml = parseWidgetXml(tempDir, files, errors);

        // Find and analyze JS bundle
        const bundle = analyzeBundle(tempDir, files, errors);

        return { mpkPath, mpkSizeBytes, files, packageXml, widgetXml, bundle, errors };
    } finally {
        try {
            rmSync(tempDir, { recursive: true, force: true });
        } catch {
            // ignore cleanup errors
        }
    }
}

function catalogFiles(dir: string, rootDir: string): MpkFileEntry[] {
    const entries: MpkFileEntry[] = [];
    try {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
            const fullPath = join(dir, entry.name);
            if (entry.isDirectory()) {
                entries.push(...catalogFiles(fullPath, rootDir));
            } else {
                const relativePath = fullPath.slice(rootDir.length + 1);
                entries.push({ path: relativePath, sizeBytes: statSync(fullPath).size });
            }
        }
    } catch {
        // ignore
    }
    return entries;
}

function parsePackageXml(tempDir: string, errors: string[]): PackageXmlInfo | undefined {
    const xmlPath = join(tempDir, "package.xml");
    if (!existsSync(xmlPath)) {
        errors.push("package.xml not found");
        return undefined;
    }

    const raw = readFileSync(xmlPath, "utf-8");

    const clientModuleName = extractXmlAttr(raw, "clientModule", "name");
    const version = extractXmlAttr(raw, "clientModule", "version");

    // <widgetFiles><widgetFile path="..." />
    const widgetFileMatch = raw.match(/<widgetFile\s+path="([^"]+)"/);
    const widgetFilePath = widgetFileMatch?.[1];

    // <files path="..." />
    const filesMatch = raw.match(/<files\s+path="([^"]+)"/);
    const filesPath = filesMatch?.[1];

    return { clientModuleName, version, widgetFilePath, filesPath, raw };
}

function parseWidgetXml(tempDir: string, files: MpkFileEntry[], errors: string[]): WidgetXmlInfo | undefined {
    const xmlFile = files.find(f => f.path.endsWith(".xml") && !f.path.includes("package.xml"));
    if (!xmlFile) {
        errors.push("No widget .xml found");
        return undefined;
    }

    const raw = readFileSync(join(tempDir, xmlFile.path), "utf-8");

    const id = extractXmlAttr(raw, "widget", "id");
    const pluginWidgetStr = extractXmlAttr(raw, "widget", "pluginWidget");
    const needsEntityContextStr = extractXmlAttr(raw, "widget", "needsEntityContext");

    const propertyCount = (raw.match(/<property\s/g) ?? []).length;

    return {
        id,
        pluginWidget: pluginWidgetStr !== undefined ? pluginWidgetStr === "true" : undefined,
        needsEntityContext: needsEntityContextStr !== undefined ? needsEntityContextStr === "true" : undefined,
        propertyCount,
        raw
    };
}

function analyzeBundle(tempDir: string, files: MpkFileEntry[], errors: string[]): BundleInfo | undefined {
    // Main bundle is always in a subdirectory (e.g., com/mendix/.../Widget.js or mendix/widgetname/Widget.js).
    // Top-level editorConfig.js and editorPreview.js are not the runtime bundle.
    const jsFile =
        files.find(
            f =>
                f.path.endsWith(".js") &&
                f.path.includes("/") &&
                !f.path.includes("editorPreview") &&
                !f.path.includes("editorConfig")
        ) ??
        files.find(
            f => f.path.endsWith(".js") && !f.path.includes("editorPreview") && !f.path.includes("editorConfig")
        );

    if (!jsFile) {
        errors.push("No JS bundle found");
        return undefined;
    }

    const fullPath = join(tempDir, jsFile.path);
    const content = readFileSync(fullPath, "utf-8");

    const containsDefine = content.includes("define(");
    const containsExportDefault = /export\s+default\s/.test(content);
    const containsExportNamed = /export\s+\{/.test(content) || /export\s+function\s/.test(content);
    const hasUseStrict = content.includes('"use strict"') || content.includes("'use strict'");

    let format: "amd" | "esm" | "unknown" = "unknown";
    if (containsDefine) format = "amd";
    else if (containsExportDefault || containsExportNamed) format = "esm";

    // Collect first few export/define patterns for comparison
    const exportPattern: string[] = [];
    const patterns = content.matchAll(/(export\s+(?:default\s+)?(?:function|class|const|let|var)\s+\w+|define\s*\()/g);
    for (const match of patterns) {
        if (exportPattern.length < 5) exportPattern.push(match[0]);
    }

    return {
        fileName: basename(jsFile.path),
        sizeBytes: jsFile.sizeBytes,
        format,
        hasUseStrict,
        exportPattern,
        containsDefine,
        containsExportDefault,
        containsExportNamed
    };
}

function extractXmlAttr(xml: string, tagName: string, attrName: string): string | undefined {
    const pattern = new RegExp(`<${tagName}[^>]+${attrName}="([^"]+)"`, "i");
    return xml.match(pattern)?.[1];
}

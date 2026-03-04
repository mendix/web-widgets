import Archiver from "archiver";
import { copyFileSync, createWriteStream, existsSync, mkdirSync, readFileSync, rmSync } from "fs";
import { cp } from "fs/promises";
import { join, resolve } from "path";
import { build as viteBuild, defineConfig, type UserConfig } from "vite";

type EditorBuild = {
    entry: string;
    outputFile: string;
    externals: Array<string | RegExp>;
    format?: "cjs" | "es";
};

type RuntimeOutput = {
    format: "cjs" | "es" | "amd";
    entryFileName: string;
};

type FileCopy = {
    src: string;
    dest: string;
};

type WidgetPackageJson = {
    name: string;
    version: string;
    packagePath: string;
    mxpackage?: {
        mpkName?: string;
    };
};

type WidgetViteConfigOptions = {
    widgetName: string;
};

async function copyDir(src: string, dest: string): Promise<void> {
    mkdirSync(dest, { recursive: true });
    if (existsSync(src)) {
        await cp(src, dest, { recursive: true, force: true });
    }
}

async function buildEditorArtifacts(editorBuilds: EditorBuild[]): Promise<void> {
    const editorOutDir = "dist/tmp/widgets";

    for (const editorBuild of editorBuilds) {
        await viteBuild({
            configFile: false,
            build: {
                target: "es2019",
                minify: "esbuild",
                emptyOutDir: false,
                outDir: editorOutDir,
                lib: {
                    entry: editorBuild.entry,
                    formats: [editorBuild.format ?? "cjs"],
                    fileName: () => editorBuild.outputFile
                },
                rollupOptions: {
                    external: editorBuild.externals,
                    output: {
                        format: editorBuild.format ?? "cjs",
                        entryFileNames: editorBuild.outputFile,
                        inlineDynamicImports: true
                    }
                }
            }
        });
    }
}

function readWidgetPackageJson(): WidgetPackageJson {
    const packageJsonPath = resolve(process.cwd(), "package.json");
    const packageJsonText = readFileSync(packageJsonPath, "utf-8");
    return JSON.parse(packageJsonText) as WidgetPackageJson;
}

function toPackagePathDir(packagePath: string): string {
    return packagePath.replace(/\./g, "/");
}

function inferPrimaryRuntimeFormat(): "cjs" | "amd" {
    if (process.env.VITE_RUNTIME_FORMAT === "cjs") {
        return "cjs";
    }

    return "amd";
}

function inferMetadataFiles(widgetName: string): FileCopy[] {
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

function inferRequiredArtifacts(widgetName: string, packagePath: string): string[] {
    const packagePathDir = toPackagePathDir(packagePath);
    const widgetDir = widgetName.toLowerCase();

    return [
        `${widgetName}.editorConfig.js`,
        `${widgetName}.editorPreview.js`,
        `${packagePathDir}/${widgetDir}/${widgetName}.js`,
        `${packagePathDir}/${widgetDir}/${widgetName}.mjs`
    ];
}

function inferRuntimeOutDir(widgetName: string, packagePath: string): string {
    const packagePathDir = toPackagePathDir(packagePath);
    return `dist/tmp/widgets/${packagePathDir}/${widgetName.toLowerCase()}`;
}

function inferEditorBuilds(widgetName: string): EditorBuild[] {
    return [
        {
            entry: `src/${widgetName}.editorPreview.tsx`,
            outputFile: `${widgetName}.editorPreview.js`,
            externals: [/^mendix($|\/)/, /^react$/, /^react-dom$/]
        },
        {
            entry: `src/${widgetName}.editorConfig.ts`,
            outputFile: `${widgetName}.editorConfig.js`,
            externals: [/^mendix($|\/)/, /^react$/, /^react-dom$/]
        }
    ];
}

function inferRemoveBeforeCopy(packageName: string): string[] {
    const widgetPackageName = packageName.split("/").pop();
    return widgetPackageName ? [`${widgetPackageName}.css`] : [];
}

type ResolvedConfig = {
    widgetName: string;
    widgetVersion: string;
    mpkName: string;
    runtimeEntry: string;
    runtimeOutDir: string;
    runtimeOutputs: RuntimeOutput[];
    runtimeExternals: Array<string | RegExp>;
    metadataFiles: FileCopy[];
    editorBuilds: EditorBuild[];
    requiredArtifacts: string[];
    removeBeforeCopy: string[];
    define: Record<string, string>;
};

function resolveConfig(options: WidgetViteConfigOptions): ResolvedConfig {
    const widgetPackageJson = readWidgetPackageJson();
    const primaryRuntimeFormat = inferPrimaryRuntimeFormat();

    return {
        widgetName: options.widgetName,
        widgetVersion: widgetPackageJson.version,
        mpkName: widgetPackageJson.mxpackage?.mpkName ?? `${options.widgetName}.mpk`,
        runtimeEntry: `src/${options.widgetName}.tsx`,
        runtimeOutDir: inferRuntimeOutDir(options.widgetName, widgetPackageJson.packagePath),
        runtimeOutputs: [
            {
                format: primaryRuntimeFormat,
                entryFileName: `${options.widgetName}.js`
            },
            {
                format: "es",
                entryFileName: `${options.widgetName}.mjs`
            }
        ],
        runtimeExternals: ["react", "react-dom", "@mendix/widget-plugin-component-kit", "big.js", /^mendix($|\/)/],
        metadataFiles: inferMetadataFiles(options.widgetName),
        editorBuilds: inferEditorBuilds(options.widgetName),
        requiredArtifacts: inferRequiredArtifacts(options.widgetName, widgetPackageJson.packagePath),
        removeBeforeCopy: inferRemoveBeforeCopy(widgetPackageJson.name),
        define: {
            "process.env.NODE_ENV": JSON.stringify("production")
        }
    };
}

async function createMPK(options: ResolvedConfig): Promise<void> {
    const distPath = resolve(process.cwd(), "dist");
    const tmpWidgetsPath = join(distPath, "tmp", "widgets");
    const stagingDir = join(distPath, "widgets");
    const outputDir = join(process.cwd(), "dist", options.widgetVersion);
    const mpkPath = join(outputDir, options.mpkName);

    if (existsSync(stagingDir)) {
        rmSync(stagingDir, { recursive: true });
    }
    mkdirSync(stagingDir, { recursive: true });
    mkdirSync(outputDir, { recursive: true });

    for (const file of options.metadataFiles) {
        const srcPath = resolve(process.cwd(), file.src);
        const destPath = join(stagingDir, file.dest);
        mkdirSync(join(stagingDir, file.dest.split("/").slice(0, -1).join("/")), { recursive: true });
        if (existsSync(srcPath)) {
            copyFileSync(srcPath, destPath);
        }
    }

    for (const requiredArtifact of options.requiredArtifacts ?? []) {
        const requiredPath = join(tmpWidgetsPath, requiredArtifact);
        if (!existsSync(requiredPath)) {
            throw new Error(`Missing compiled artifact: ${requiredPath}`);
        }
    }

    for (const removePath of options.removeBeforeCopy ?? []) {
        const absolutePath = join(tmpWidgetsPath, removePath);
        if (existsSync(absolutePath)) {
            rmSync(absolutePath);
        }
    }

    if (existsSync(tmpWidgetsPath)) {
        await copyDir(tmpWidgetsPath, stagingDir);
    }

    await new Promise<void>((resolvePromise, reject) => {
        const output = createWriteStream(mpkPath);
        const archive = (Archiver as unknown as (format: string, options: { zlib: { level: number } }) => any)("zip", {
            zlib: { level: 9 }
        });

        output.on("close", () => {
            console.log(`✓ Created ${mpkPath} (${archive.pointer()} bytes)`);
            resolvePromise();
        });

        archive.on("error", reject);
        archive.pipe(output);
        archive.directory(stagingDir, false);
        archive.finalize();
    });
}

export default function createWidgetViteConfig(options: WidgetViteConfigOptions): UserConfig {
    const resolvedConfig = resolveConfig(options);

    return defineConfig({
        define: resolvedConfig.define,
        build: {
            target: "es2019",
            minify: "esbuild",
            lib: {
                entry: resolvedConfig.runtimeEntry,
                name: resolvedConfig.widgetName
            },
            outDir: resolvedConfig.runtimeOutDir,
            rollupOptions: {
                output: resolvedConfig.runtimeOutputs.map(runtimeOutput => ({
                    format: runtimeOutput.format,
                    entryFileNames: runtimeOutput.entryFileName,
                    inlineDynamicImports: true
                })),
                external: resolvedConfig.runtimeExternals
            }
        },
        plugins: [
            {
                name: "vite-plugin-mpk-builder",
                apply: "build",
                enforce: "post",
                async closeBundle() {
                    if (resolvedConfig.editorBuilds.length > 0) {
                        console.log("Building editor artifacts...");
                        await buildEditorArtifacts(resolvedConfig.editorBuilds);
                    }

                    console.log("Building MPK...");
                    await createMPK(resolvedConfig);
                }
            }
        ]
    });
}

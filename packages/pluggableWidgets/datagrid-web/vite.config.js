import Archiver from "archiver";
import { copyFileSync, createWriteStream, existsSync, mkdirSync, rmSync } from "fs";
import { cp } from "fs/promises";
import { join, resolve } from "path";
import { build as viteBuild, defineConfig } from "vite";

const widgetVersion = "3.8.1";
const widgetName = "Datagrid";
const useCjsRuntime = process.env.VITE_RUNTIME_FORMAT === "cjs";

async function copyDir(src, dest) {
    mkdirSync(dest, { recursive: true });
    if (existsSync(src)) {
        await cp(src, dest, { recursive: true, force: true });
    }
}

async function createMPK(distPath) {
    const stagingDir = join(distPath, "widgets");
    const outputDir = join(process.cwd(), "dist", widgetVersion);
    const mpkPath = join(outputDir, `com.mendix.widget.web.${widgetName}.mpk`);

    if (existsSync(stagingDir)) {
        rmSync(stagingDir, { recursive: true });
    }
    mkdirSync(stagingDir, { recursive: true });
    mkdirSync(outputDir, { recursive: true });

    const filesToCopy = [
        { src: "src/Datagrid.xml", dest: "Datagrid.xml" },
        { src: "src/Datagrid.icon.png", dest: "Datagrid.icon.png" },
        { src: "src/Datagrid.icon.dark.png", dest: "Datagrid.icon.dark.png" },
        { src: "src/Datagrid.tile.png", dest: "Datagrid.tile.png" },
        { src: "src/Datagrid.tile.dark.png", dest: "Datagrid.tile.dark.png" },
        { src: "../../../LICENSE", dest: "License.txt" },
        { src: "src/package.xml", dest: "package.xml" }
    ];

    for (const file of filesToCopy) {
        const srcPath = resolve(process.cwd(), file.src);
        const destPath = join(stagingDir, file.dest);
        mkdirSync(join(stagingDir, file.dest.split("/").slice(0, -1).join("/")), { recursive: true });
        if (existsSync(srcPath)) {
            copyFileSync(srcPath, destPath);
        }
    }

    const tmpWidgetsPath = join(distPath, "tmp", "widgets");
    const requiredCompiledFiles = [
        join(tmpWidgetsPath, "Datagrid.editorConfig.js"),
        join(tmpWidgetsPath, "Datagrid.editorPreview.js"),
        join(tmpWidgetsPath, "com", "mendix", "widget", "web", "datagrid", "Datagrid.js"),
        join(tmpWidgetsPath, "com", "mendix", "widget", "web", "datagrid", "Datagrid.mjs")
    ];

    for (const requiredFile of requiredCompiledFiles) {
        if (!existsSync(requiredFile)) {
            throw new Error(`Missing compiled artifact: ${requiredFile}`);
        }
    }

    const previewCssPath = join(tmpWidgetsPath, "datagrid-web.css");
    if (existsSync(previewCssPath)) {
        rmSync(previewCssPath);
    }

    if (existsSync(tmpWidgetsPath)) {
        await copyDir(tmpWidgetsPath, stagingDir);
    }

    return new Promise((resolvePromise, reject) => {
        const output = createWriteStream(mpkPath);
        const archive = Archiver("zip", { zlib: { level: 9 } });

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

async function buildEditorArtifacts() {
    const editorOutDir = "dist/tmp/widgets";
    const editorExternals = [/^mendix($|\/)/, /^react$/, /^react-dom$/];

    await viteBuild({
        configFile: false,
        build: {
            target: "es2019",
            minify: "esbuild",
            emptyOutDir: false,
            outDir: editorOutDir,
            lib: {
                entry: "src/Datagrid.editorPreview.tsx",
                formats: ["cjs"],
                fileName: () => "Datagrid.editorPreview.js"
            },
            rollupOptions: {
                external: editorExternals,
                output: {
                    format: "cjs",
                    entryFileNames: "Datagrid.editorPreview.js",
                    inlineDynamicImports: true
                }
            }
        }
    });

    await viteBuild({
        configFile: false,
        build: {
            target: "es2019",
            minify: "esbuild",
            emptyOutDir: false,
            outDir: editorOutDir,
            lib: {
                entry: "src/Datagrid.editorConfig.ts",
                formats: ["cjs"],
                fileName: () => "Datagrid.editorConfig.js"
            },
            rollupOptions: {
                external: editorExternals,
                output: {
                    format: "cjs",
                    entryFileNames: "Datagrid.editorConfig.js",
                    inlineDynamicImports: true
                }
            }
        }
    });
}

export default defineConfig({
    define: {
        "process.env.NODE_ENV": JSON.stringify("production")
    },
    build: {
        target: "es2019",
        minify: "esbuild",
        lib: {
            entry: "src/Datagrid.tsx",
            name: widgetName
        },
        outDir: "dist/tmp/widgets/com/mendix/widget/web/datagrid",
        rollupOptions: {
            output: [
                {
                    format: useCjsRuntime ? "cjs" : "amd",
                    entryFileNames: `${widgetName}.js`,
                    inlineDynamicImports: true
                },
                {
                    format: "es",
                    entryFileNames: `${widgetName}.mjs`,
                    inlineDynamicImports: true
                }
            ],
            external: ["react", "react-dom", "big.js", /^mendix($|\/)/]
        }
    },
    plugins: [
        {
            name: "vite-plugin-mpk-builder",
            apply: "build",
            enforce: "post",
            async closeBundle() {
                console.log("Building editor artifacts...");
                await buildEditorArtifacts();
                console.log("Building MPK...");
                await createMPK(resolve(process.cwd(), "dist"));
            }
        }
    ]
});

import Archiver from "archiver";
import { copyFileSync, createWriteStream, existsSync, mkdirSync, rmSync } from "fs";
import { cp } from "fs/promises";
import { join, resolve } from "path";
import { defineConfig } from "vite";

const widgetVersion = "3.2.3";
const widgetName = "Badge";

/**
 * Recursively copy files and directories
 */
async function copyDir(src, dest) {
    mkdirSync(dest, { recursive: true });
    if (existsSync(src)) {
        await cp(src, dest, { recursive: true, force: true });
    }
}

/**
 * Post-build hook to package widget files into MPK
 */
async function createMPK(distPath) {
    const stagingDir = join(distPath, "widgets");
    const outputDir = join(process.cwd(), "dist", widgetVersion);
    const mpkPath = join(outputDir, `${widgetName}.mpk`);

    // Clean staging directory
    if (existsSync(stagingDir)) {
        rmSync(stagingDir, { recursive: true });
    }
    mkdirSync(stagingDir, { recursive: true });
    mkdirSync(outputDir, { recursive: true });

    // Copy widget metadata files
    const filesToCopy = [
        { src: "src/Badge.xml", dest: "Badge.xml" },
        { src: "src/Badge.editorConfig.ts", dest: "Badge.editorConfig.js" },
        { src: "src/Badge.editorPreview.tsx", dest: "Badge.editorPreview.js" },
        { src: "src/Badge.icon.png", dest: "Badge.icon.png" },
        { src: "src/Badge.icon.dark.png", dest: "Badge.icon.dark.png" },
        { src: "src/Badge.tile.png", dest: "Badge.tile.png" },
        { src: "src/Badge.tile.dark.png", dest: "Badge.tile.dark.png" },
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

    // Copy compiled widget files from dist/tmp/widgets
    const tmpWidgetsPath = join(distPath, "tmp", "widgets");
    if (existsSync(tmpWidgetsPath)) {
        await copyDir(tmpWidgetsPath, stagingDir);
    }

    // Create MPK (ZIP file)
    return new Promise((resolve, reject) => {
        const output = createWriteStream(mpkPath);
        const archive = Archiver("zip", { zlib: { level: 9 } });

        output.on("close", () => {
            console.log(`✓ Created ${mpkPath} (${archive.pointer()} bytes)`);
            resolve();
        });

        archive.on("error", reject);
        archive.pipe(output);
        archive.directory(stagingDir, false);
        archive.finalize();
    });
}

export default defineConfig({
    build: {
        target: "es2019",
        minify: "esbuild",
        lib: {
            entry: "src/Badge.tsx",
            name: widgetName,
            formats: ["es", "cjs"],
            fileName: format => (format === "es" ? `${widgetName}.mjs` : `${widgetName}.js`)
        },
        outDir: "dist/tmp/widgets/com/mendix/widget/custom/badge",
        rollupOptions: {
            output: {
                inlineDynamicImports: true
            },
            external: ["react", "react-dom", "@mendix/widget-plugin-component-kit"]
        }
    },
    plugins: [
        {
            name: "vite-plugin-mpk-builder",
            apply: "build",
            enforce: "post",
            async closeBundle() {
                console.log("Building MPK...");
                await createMPK(resolve(process.cwd(), "dist"));
            }
        }
    ]
});

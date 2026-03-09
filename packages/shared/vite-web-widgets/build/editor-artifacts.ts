import { build as viteBuild } from "vite";
import type { EditorBuild } from "../types";
import { getResolveAlias } from "../config/resolve";

export async function buildEditorArtifacts(editorBuilds: EditorBuild[], isDev: boolean = false): Promise<void> {
    const editorOutDir = "dist/tmp/widgets";
    const alias = getResolveAlias();
    const minifyMode = isDev ? false : "esbuild";
    const sourcemapMode = isDev ? "inline" : false;

    for (const editorBuild of editorBuilds) {
        await viteBuild({
            configFile: false,
            resolve: {
                alias
            },
            build: {
                target: "es2019",
                minify: minifyMode,
                sourcemap: sourcemapMode,
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

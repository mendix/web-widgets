import type { ConfigEnv, UserConfig } from "vite";
import type { WidgetViteConfigOptions } from "../types";
import { buildEditorArtifacts } from "../build/editor-artifacts";
import { createMPK, deployMPKToMxProject } from "../build/mpk";
import { getResolveAlias, isBuildDev, resolveConfig } from "./resolve";

export function createConfig(options: WidgetViteConfigOptions, env: ConfigEnv): UserConfig {
    const { mode } = env;

    const isDev = isBuildDev(mode);
    const resolvedConfig = resolveConfig(options, isDev);
    const alias = getResolveAlias();
    const minifyMode = isDev ? false : "esbuild";
    const sourcemapMode = isDev ? "inline" : false;

    return {
        define: resolvedConfig.define,
        resolve: {
            alias
        },
        build: {
            target: "es2019",
            minify: minifyMode,
            sourcemap: sourcemapMode,
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
                        await buildEditorArtifacts(resolvedConfig.editorBuilds, isDev);
                    }

                    console.log("Building MPK...");
                    const mpkPath = await createMPK(resolvedConfig);
                    await deployMPKToMxProject(mpkPath);
                }
            }
        ]
    };
}

import copy from "@guanghechen/rollup-plugin-copy";
import commonjs from "@rollup/plugin-commonjs";
import image from "@rollup/plugin-image";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import url from "@rollup/plugin-url";
import { resolve as resolvePath } from "node:path";
import type { RollupOptions } from "rollup";
import bundleAnalyzer from "rollup-plugin-analyzer";
import command from "rollup-plugin-command";
import livereload from "rollup-plugin-livereload";
import { minify } from "rollup-plugin-swc3";
import type { Context } from "./context.js";
import { createMPK } from "./mpk-utils.js";
import { bundleSize } from "./plugin/bundle-size.js";
import { license } from "./plugin/license.js";
import { widgetTyping } from "./plugin/widget-typing.js";

export function rollupConfig(ctx: Context): RollupOptions[] {
    const { rootDir, env, config, options, bundle } = ctx;
    const { use } = config;

    const ts = () =>
        typescript({
            exclude: ["**/__tests__/**/*"],
            compilerOptions: {
                sourceMap: !!options.sourcemap,
                noEmitOnError: !options.watch
            }
        });

    const analyze = () =>
        use.bundleAnalyzer
            ? bundleAnalyzer({
                  summaryOnly: true,
                  limit: config.plugin.bundleAnalyzer.limit
              })
            : null;

    const size = () =>
        use.bundleSize
            ? bundleSize({
                  warnOnExceeded: env.production
              })
            : null;

    // We need to create .mpk and copy results to test project after bundling is finished.
    // In case of a regular build is it is on `writeBundle` of the last config we define
    // (since rollup processes configs sequentially). But in watch mode rollup re-bundles only
    // configs affected by a change => we cannot know in advance which one will be "the last".
    // So we run the same logic for all configs, letting the last one win.
    const mpk = () =>
        command([
            () =>
                createMPK({
                    mpkFile: bundle.mpk.mpkFileAbsolute,
                    clientModuleRootDir: resolvePath(bundle.dirs.clientModule.rootDir)
                })
        ]);

    const mainEntryPlugins = [
        nodeResolve(),
        commonjs(),
        ts(),
        url({
            include: imagesAndFonts,
            limit: 0,
            // Prefix for the actual import, relative to Mendix web server root
            publicPath: `${bundle.urlPaths.assetsPublicPath}/`,
            destDir: bundle.dirs.clientModule.assetsDir
        }),
        // NOTE: I'm still not sure why we need image plugin. It probably never used.
        image(),
        use.license ? license(bundle.dirs.clientModule.rootDir) : null,
        use.minify ? minify({ compress: true, mangle: true, sourceMap: !!options.sourcemap }) : null,
        analyze(),
        copy({
            targets: [
                { src: "src/package.xml", dest: bundle.dirs.clientModule.rootDir },
                { src: "src/**/*.xml", dest: bundle.dirs.clientModule.widgetDefinitionDir },
                { src: "src/*.{icon,tile}*.png", dest: bundle.dirs.clientModule.widgetDefinitionDir }
            ],
            verbose: config.verbose
        }),
        widgetTyping({ sourceDir: `${rootDir}/src` }),
        size(),
        use.livereload ? livereload() : null,
        mpk()
    ];

    const editorConfigPlugins = [
        nodeResolve(),
        commonjs(),
        ts(),
        url({ include: ["**/*.svg"], limit: 143360 }),
        // NOTE: I'm still not sure why we need image plugin. It probably never used.
        image(),
        analyze(),
        size(),
        mpk()
    ];

    const editorPreviewPlugins = [
        nodeResolve(),
        commonjs(),
        ts(),
        // NOTE: I'm still not sure why we need image plugin. It probably never used.
        image(),
        analyze(),
        size(),
        mpk()
    ];

    const external = [/^mendix($|\/)/, /^react$/, /^react\/jsx-runtime$/, /^react-dom$/, /^big.js$/];

    const entries: RollupOptions[] = [
        {
            input: bundle.inputs.main,
            output: [
                {
                    format: "amd",
                    file: bundle.outputs.mainAmd
                },
                {
                    format: "esm",
                    file: bundle.outputs.mainEsm
                }
            ],
            external,
            plugins: mainEntryPlugins
        }
    ];

    if (bundle.inputs.editorPreview) {
        entries.push({
            input: bundle.inputs.editorPreview,
            output: {
                format: "commonjs",
                file: bundle.outputs.editorPreview
            },
            external,
            plugins: editorPreviewPlugins
        });
    }

    if (bundle.inputs.editorConfig) {
        entries.push({
            input: bundle.inputs.editorConfig,
            output: {
                format: "commonjs",
                file: bundle.outputs.editorConfig
            },
            external,
            plugins: editorConfigPlugins
        });
    }

    return entries;
}

const imagesAndFonts = [
    "**/*.svg",
    "**/*.png",
    "**/*.jp(e)?g",
    "**/*.gif",
    "**/*.webp",
    "**/*.ttf",
    "**/*.woff(2)?",
    "**/*.eot"
];

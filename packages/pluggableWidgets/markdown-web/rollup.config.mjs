import copyFiles from "@mendix/rollup-web-widgets/copyFiles.mjs";
import { postCssPlugin } from "@mendix/pluggable-widgets-tools/configs/rollup.config.mjs";
import copy from "rollup-plugin-copy";

const widgetDir = "com/mendix/widget/web/markdown";
const katexFontsDir = `${widgetDir}/assets/fonts`;

/**
 * KaTeX declares its font urls relative to its own stylesheet (`url(fonts/KaTeX_Main-Regular.woff2)`).
 * Those files live in node_modules, so the widget build cannot copy them as regular widget assets.
 * Instead the fonts are copied next to the widget bundle (see the copy plugin below) and the urls
 * are pointed at that location. Path has to be relative to the widget package root, because Studio Pro
 * bundles the widget css into the theme css.
 */
const katexFontsPostcssPlugin = {
    postcssPlugin: "markdown-katex-fonts",
    Declaration(decl) {
        if (decl.value.includes("katex/dist/fonts/")) {
            decl.value = decl.value.replace(
                /url\(\s*(['"]?)[^)'"]*katex\/dist\/fonts\/([^)'"]+)\1\s*\)/g,
                `url($1${katexFontsDir}/$2$1)`
            );
        }
    }
};

export default args => {
    const result = copyFiles(args);
    return result.map(config => {
        const outputFormat = config.output.format;
        if (outputFormat !== "amd" && outputFormat !== "es") {
            // Editor preview and editor config inline their assets, no adjustment needed.
            return config;
        }

        const plugins = config.plugins.map(plugin =>
            plugin?.name === "postcss"
                ? postCssPlugin(outputFormat, Boolean(args.configProduction), [katexFontsPostcssPlugin])
                : plugin
        );

        if (outputFormat === "amd") {
            // Only the amd bundle extracts the widget css, so the fonts are copied once.
            plugins.push(
                copy({
                    targets: [
                        {
                            src: "node_modules/katex/dist/fonts/*.woff2",
                            dest: `dist/tmp/widgets/${katexFontsDir}`
                        }
                    ]
                })
            );
        }

        return { ...config, plugins };
    });
};

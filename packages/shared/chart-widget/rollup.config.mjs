import { getBabelOutputPlugin } from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import url from "@rollup/plugin-url";
import postcssImport from "postcss-import";
import analyze from "rollup-plugin-analyzer";
import bundleSize from "rollup-plugin-bundle-size";
import postcss from "rollup-plugin-postcss";

export default ({ configProduction: production = false }) => {
    const external = [/^mendix($|\/)/m, /^react$/m, /^react-dom$/m, /^react\/jsx-runtime$/m, /^big.js$/m];
    const sourceMaps = !production;

    /**
     * @type {import('rollup').RollupOptions}
     */
    const chartWidget = {
        input: "src/chart-widget.tsx",
        output: {
            format: "amd",
            file: "dist/chart-widget.js"
        },
        external,
        plugins: [
            resolve(),
            commonjs(),
            analyze({ summaryOnly: true, limit: production ? 0 : 20 }),
            replace({
                preventAssignment: true,
                values: {
                    "process.env.NODE_ENV": JSON.stringify(production ? "production" : "development")
                }
            }),
            typescript(),
            url({
                // Disable inline images
                limit: 0,
                // Prefix for url, relative to Mendix web server root
                publicPath: `widgets/com/mendix/shared/chart-widget/assets/`,
                destDir: "dist/assets"
            }),
            postcss({
                extensions: [".css", ".sass", ".scss"],
                extract: true,
                inject: false,
                minimize: production,
                plugins: [postcssImport()],
                sourceMap: sourceMaps ? "inline" : false,
                use: ["sass"],
                to: "dist/chart-widget.css"
            }),
            getBabelOutputPlugin({
                allowAllFormats: true,
                babelrc: false,
                // Disable compact output to keep comments
                compact: false,
                // Keep all comments (terser will process them).
                shouldPrintComment: () => true,
                presets: [["@babel/preset-env", { targets: { safari: "12" } }]]
            }),
            production ? terser({ output: { comments: /@preserve|@?copyright|@lic|@cc_on|licen[cs]e|^\**!/i } }) : null,
            bundleSize()
        ],
        onwarn: (warning, warn) => {
            // fast-json-patch has warnings, so we suppress them.
            const ignore =
                warning.loc && warning.loc.file.includes("fast-json-patch") && warning.code === "THIS_IS_UNDEFINED";
            if (ignore) {
                return;
            }
            warn(warning);
        }
    };

    return chartWidget;
};


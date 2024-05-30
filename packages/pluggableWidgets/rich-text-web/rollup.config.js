import json from "@rollup/plugin-json";
import { dirname, join } from "path";
import copy from "recursive-copy";
import command from "rollup-plugin-command";
const sourcePath = process.cwd();
const outDir = join(sourcePath, "dist/tmp/widgets/");
const widgetPackageJson = require(join(sourcePath, "package.json"));
const widgetName = widgetPackageJson.widgetName;
const widgetPackage = widgetPackageJson.packagePath;
const outWidgetDir = join(widgetPackage.replace(/\./g, "/"), widgetName.toLowerCase());
const absoluteOutPackageDir = join(outDir, outWidgetDir);

const PROD_FILTER_PLUGINS_THEMES = [
    "**/skins/content/default/*.js",
    "**/skins/content/default/*.min.css",
    "**/skins/content/dark/*.js",
    "**/skins/content/dark/*.min.css",
    "**/skins/ui/oxide/*.min.*",
    "**/skins/ui/oxide/*.js*",
    "**/plugins/**/index.js",
    "**/plugins/**/*.min.*",
    "**/tinymce.js"
];

const DEV_FILTER_PLUGINS_THEMES = [
    "**/skins/content/default/*",
    "**/skins/content/dark/*",
    "**/skins/ui/oxide/*.*",
    "**/plugins/**/*.*",
    "**/tinymce.js"
];

export default args => {
    const result = args.configDefaultConfig;
    const production = Boolean(args.configProduction);
    return result.map((config, index) => {
        if (index === 0) {
            config.plugins = [
                ...config.plugins,
                copyTinyMCEDirToDist(
                    absoluteOutPackageDir,
                    production ? PROD_FILTER_PLUGINS_THEMES : DEV_FILTER_PLUGINS_THEMES
                )
            ];
        }
        config.plugins.push(json());
        return config;
    });
};

function copyTinyMCEDirToDist(outDir, filter) {
    return command([
        async () => {
            return copy(dirname(require.resolve("tinymce")), outDir, {
                transform: src => {},
                overwrite: true,
                filter: filter
            });
        }
    ]);
}

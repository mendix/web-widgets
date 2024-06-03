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

const FILTER_PLUGINS_THEMES = [
    "**/skins/content/default/*.js",
    "**/skins/content/default/content.css",
    "**/skins/content/dark/*.js",
    "**/skins/content/dark/content.css",
    "**/skins/ui/oxide/*.min.css",
    "**/skins/ui/oxide/*.js*",
    "**/plugins/**/index.js",
    "**/plugins/**/plugin.js",
    "**/tinymce.min.js"
];

export default args => {
    const result = args.configDefaultConfig;
    return result.map((config, index) => {
        if (index === 0) {
            config.plugins = [...config.plugins, copyTinyMCEDirToDist(absoluteOutPackageDir, FILTER_PLUGINS_THEMES)];
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

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

export default args => {
    const result = args.configDefaultConfig;
    return result.map((config, index) => {
        if (index === 0) {
            config.plugins = [...config.plugins, copyTinyMCEDirToDist(absoluteOutPackageDir)];
        }
        config.plugins.push(json());
        return config;
    });
};

function copyTinyMCEDirToDist(outDir) {
    return command([
        async () => {
            return copy(dirname(require.resolve("tinymce")), outDir, {
                transform: src => {},
                overwrite: true,
                filter: [
                    "**/skins/content/default/*",
                    "**/skins/ui/oxide/*.min.*",
                    "**/plugins/**/*.*",
                    "**/tinymce.js"
                ]
            });
        }
    ]);
}

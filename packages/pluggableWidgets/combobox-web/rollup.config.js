const { join } = require("path");
const { cp, mkdir } = require("shelljs");

const sourcePath = process.cwd();
const outDir = join(sourcePath, "/dist/tmp/widgets/");
const widgetPackageJson = require(join(sourcePath, "package.json"));
const widgetName = widgetPackageJson.widgetName;
const widgetPackage = widgetPackageJson.packagePath;
const outWidgetDir = join(widgetPackage.replace(/\./g, "/"), widgetName.toLowerCase());
const absoluteOutPackageDir = join(outDir, outWidgetDir);

module.exports = args => {
    const result = args.configDefaultConfig;

    // Ensure the locales directory exists in the output
    const localesDir = join(absoluteOutPackageDir, "locales");
    mkdir("-p", localesDir);

    // Copy translation files
    const translationFiles = join(sourcePath, "dist/locales/**/*");
    cp("-r", translationFiles, localesDir);

    return result;
};

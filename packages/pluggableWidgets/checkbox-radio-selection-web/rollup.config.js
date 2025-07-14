const { join } = require("path");
const { cp, mkdir, rm } = require("shelljs");

const sourcePath = process.cwd();
const outDir = join(sourcePath, "/dist/tmp/widgets/");

module.exports = args => {
    const result = args.configDefaultConfig;

    const localesDir = join(outDir, "locales/");
    mkdir("-p", localesDir);

    const translationFiles = join(sourcePath, "dist/locales/**/*");
    // copy everything under dist/locales to dist/tmp/widgets/locales for the widget mpk
    cp("-r", translationFiles, localesDir);
    // remove root level *.json locales files (duplicate with language specific files (e.g. en-US/*.json))
    rm("-f", join(outDir, "locales/*.json"), localesDir);

    return result;
};

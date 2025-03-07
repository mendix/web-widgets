const { join } = require("path");
const { cp, mkdir } = require("shelljs");

const sourcePath = process.cwd();
const outDir = join(sourcePath, "/dist/tmp/widgets/");

module.exports = args => {
    const result = args.configDefaultConfig;

    const localesDir = join(outDir, "locales");
    mkdir("-p", localesDir);

    const translationFiles = join(sourcePath, "dist/locales/**/*");
    cp("-r", translationFiles, localesDir);

    return result;
};

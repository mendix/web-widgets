import { mkdirSync } from "node:fs";
import { join } from "path";

export default args => {
    const result = args.configDefaultConfig;
    const [jsConfig, mJsConfig] = result;

    // create target dir before any bundling to make sure casing is correct:
    // expected: com/mendix/widget/custom/Maps
    mkdirSync(join("dist", "tmp", "widgets", "com", "mendix", "widget", "custom", "Maps"), { recursive: true });

    // We change the output because maps widget package was wrongly named with uppercase M in the past.
    jsConfig.output.file = join(__dirname, "dist/tmp/widgets/com/mendix/widget/custom/Maps/Maps.js");
    mJsConfig.output.file = join(__dirname, "dist/tmp/widgets/com/mendix/widget/custom/Maps/Maps.mjs");

    return result;
};

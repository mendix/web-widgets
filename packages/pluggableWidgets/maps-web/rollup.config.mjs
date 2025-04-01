import { mkdirSync } from "node:fs";
import { fileURLToPath } from "url";

export default args => {
    const result = args.configDefaultConfig;
    const [jsConfig, mJsConfig] = result;

    const folderUrl = new URL("dist/tmp/widgets/com/mendix/widget/custom/Maps/", import.meta.url);
    const folderPath = fileURLToPath(folderUrl);

    // create target dir before any bundling to make sure casing is correct:
    // expected: com/mendix/widget/custom/Maps
    mkdirSync(folderPath, { recursive: true });

    // We change the output because maps widget package was wrongly named with uppercase M in the past.
    jsConfig.output.file = fileURLToPath(new URL("Maps.js", folderUrl));
    mJsConfig.output.file = fileURLToPath(new URL("Maps.mjs", folderUrl));

    return result;
};

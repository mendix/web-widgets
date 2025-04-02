import { fileURLToPath } from "url";

export default args => {
    const result = args.configDefaultConfig;
    const [jsConfig, mJsConfig] = result;

    const folderUrl = new URL("dist/tmp/widgets/com/mendix/widget/custom/RangeSlider/", import.meta.url);

    // We change the output because range slider widget package was wrongly named with uppercase R and S in the past.
    jsConfig.output.file = fileURLToPath(new URL("RangeSlider.js", folderUrl));
    mJsConfig.output.file = fileURLToPath(new URL("RangeSlider.mjs", folderUrl));

    return result;
};

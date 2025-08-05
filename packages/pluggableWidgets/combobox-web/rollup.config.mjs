import { copyDefaultFiles } from "@mendix/rollup-web-widgets/helper.mjs";

export default args => {
    const result = args.configDefaultConfig;
    copyDefaultFiles(import.meta.dirname);
    return result;
};

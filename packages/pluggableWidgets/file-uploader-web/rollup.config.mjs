import json from "@rollup/plugin-json";
import { withSharedLibs } from "@mendix/rollup-web-widgets/sharedLibs.mjs";

export default args => {
    const result = args.configDefaultConfig;
    return withSharedLibs(
        args,
        result.map((config, _index) => {
            config.plugins = [...config.plugins, json()];
            return config;
        })
    );
};

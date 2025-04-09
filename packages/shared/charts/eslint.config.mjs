import config from "@mendix/eslint-config-web-widgets/widget-ts.mjs";

export default [
    ...config,
    {
        ignores: ["node_modules", "dist", "rollup.config.js", "scripts"]
    }
];

import config from "@mendix/eslint-config-web-widgets/widget-ts.mjs";

export default [
    ...config,
    {
        ignores: ["tests", "dist", "src/javascriptsource"]
    }
];

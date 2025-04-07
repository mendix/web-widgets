import config from "@mendix/eslint-config-web-widgets/widget-ts.mjs";

export default [
    ...config,
    {
        ignores: ["src/changelog-parser/parser/module/module.js", "src/changelog-parser/parser/widget/widget.js"]
    }
];

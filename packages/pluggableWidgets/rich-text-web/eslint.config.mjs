import config from "@mendix/eslint-config-web-widgets/widget-ts.mjs";

export default [
    ...config,
    {
        ignores: ["src/assets/*", "src/utils/formats/quill-table-better"]
    }
];

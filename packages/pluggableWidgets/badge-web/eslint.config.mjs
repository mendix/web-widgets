import config from "@mendix/eslint-config-web-widgets/widget-ts.mjs";

export default [
    ...config,
    {
        ignores: ["playwright.config.js", "e2e/*.js"],
        rules: {
            ...config.rules,
            "react/react-in-jsx-scope": "off"
        }
    }
];

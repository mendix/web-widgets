import config from "@mendix/eslint-config-web-widgets/widget-ts.mjs";

export default [
    ...config,
    {
        rules: {
            ...config.rules,
            "react/react-in-jsx-scope": "off"
        }
    }
];

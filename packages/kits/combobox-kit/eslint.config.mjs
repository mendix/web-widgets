import config from "@mendix/eslint-config-web-widgets/widget-ts.mjs";

export default [
    ...config,
    // A copy of the typings combobox-web generates from Combobox.xml; a spec keeps it byte-for-byte equal.
    { ignores: ["src/typings/ComboboxProps.ts"] }
];

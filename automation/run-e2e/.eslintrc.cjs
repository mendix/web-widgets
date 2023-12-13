module.exports = {
    root: true,
    env: {
        node: true,
        es2021: true
    },
    extends: ["eslint:recommended", "plugin:cypress/recommended", "plugin:playwright/recommended"],
    parserOptions: {
        sourceType: "module",
        ecmaVersion: 2021
    }
};

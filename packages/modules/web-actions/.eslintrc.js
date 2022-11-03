module.exports = {
    root: true,
    env: {
        browser: true,
        es2017: true
    },
    extends: "eslint:recommended",
    overrides: [],
    parserOptions: {
        sourceType: "module"
    },
    globals: {
        mx: "readonly"
    },
    rules: {
        "no-unused-vars": [
            "error",
            { vars: "all", args: "after-used", ignoreRestSiblings: false, varsIgnorePattern: "Big" }
        ]
    }
};

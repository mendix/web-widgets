import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";

export default defineConfig([
    {
        files: ["**/*.{,m,c}js"],
        languageOptions: {
            globals: {
                ...globals.browser,
                mx: "readonly"
            },
            ecmaVersion: 2021,
            sourceType: "module"
        }
    },
    {
        files: ["**/*.{,m,c}js"],
        plugins: { js },
        extends: ["js/recommended"],
        rules: {
            "no-unused-vars": [
                "error",
                {
                    vars: "all",
                    args: "after-used",
                    ignoreRestSiblings: false,
                    varsIgnorePattern: "Big",
                    caughtErrorsIgnorePattern: ".*"
                }
            ]
        }
    }
]);

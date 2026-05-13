import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import playwright from "eslint-plugin-playwright";

export default defineConfig([
    {
        files: ["**/*.{,m,c}js"],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.es2021
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
            "no-unused-vars": "warn"
        }
    },
    {
        files: ["**/e2e/**/*.spec.{,m,c}js"],
        plugins: { playwright },
        rules: {
            "playwright/no-wait-for-timeout": "error",
            "playwright/no-networkidle": "warn",
            "playwright/prefer-web-first-assertions": "warn"
        }
    }
]);

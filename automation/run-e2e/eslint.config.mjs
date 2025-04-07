import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";

export default defineConfig([
    {
        files: ["**/*.js"],
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
        files: ["**/*.js"],
        plugins: { js },
        extends: ["js/recommended"],
        rules: {
            "no-unused-vars": "warn"
        }
    }
]);

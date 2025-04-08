import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";

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
        extends: ["js/recommended"]
    }
]);

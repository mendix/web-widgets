import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";

export default defineConfig([
    {
        files: ["**/*.js"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.commonjs,
                ...globals.es2021
            },
            ecmaVersion: 12
        }
    },
    { files: ["**/*.js"], plugins: { js }, extends: ["js/recommended"] }
]);

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jestPlugin from "eslint-plugin-jest";
import packageJson from "eslint-plugin-package-json";
import packageJsonFieldsOrder from "@mendix/prettier-config-web-widgets/package-json-fields-order.js";

export default tseslint.config(
    {
        name: "generic eslint",
        extends: [eslint.configs.recommended],
        rules: {
            "no-undef": "warn",
            "no-unused-vars": "warn",
            "array-callback-return": "error",
            curly: "error",
            "dot-notation": "error",
            eqeqeq: ["error", "allow-null"],
            "guard-for-in": "error",
            "new-parens": "error",
            "no-async-promise-executor": "error",
            "no-bitwise": "error",
            "no-caller": "error",
            "no-case-declarations": "off",
            "no-dupe-class-members": "off",
            "no-duplicate-imports": "error",
            "no-extra-bind": "error",
            "no-implied-eval": "error",
            "no-loop-func": "error",
            "no-new-func": "error",
            "no-new-wrappers": "error",
            "no-return-await": "error",
            "no-sequences": "error",
            "no-template-curly-in-string": "error",
            "no-throw-literal": "error",
            "no-unmodified-loop-condition": "error",
            "no-unneeded-ternary": "error",
            "no-unused-expressions": "error",
            "no-useless-call": "error",
            "no-useless-catch": "error",
            "no-useless-computed-key": "error",
            "no-useless-return": "error",
            "no-undef-init": "error",
            "no-var": "error",
            "no-void": "error",
            "object-shorthand": "error",
            "one-var": ["error", "never"],
            "prefer-arrow-callback": "error",
            "prefer-const": "error",
            "prefer-object-spread": "error",
            "prefer-promise-reject-errors": "error",
            "prefer-rest-params": "error",
            "prefer-spread": "error",
            radix: "error",
            "spaced-comment": "error"
        }
    },
    {
        name: "react",
        files: ["**/*.tsx", "**/*.jsx"],
        extends: [reactPlugin.configs.flat.recommended],
        settings: {
            react: {
                createClass: "createReactClass",
                pragma: "createElement",
                version: "detect"
            }
        },
        rules: {
            "react/display-name": "off",
            "react/prop-types": "off",
            "react/no-access-state-in-setstate": "error",
            "react/no-did-mount-set-state": "error",
            "react/no-find-dom-node": "off",
            "react/no-will-update-set-state": "error",
            "react/jsx-boolean-value": ["error", "never"],
            "react/no-deprecated": "warn",
            "react/jsx-uses-vars": "error",
            "react/jsx-uses-react": "off"
        }
    },
    {
        name: "jest",
        extends: [jestPlugin.configs["flat/recommended"]],
        files: ["**/*.spec.ts", "**/*.spec.tsx"],
        // TODO: fix whose and move them back errors
        rules: {
            "jest/no-conditional-expect": "warn",
            "jest/no-alias-methods": "warn",
            "jest/no-mocks-import": "warn",
            "jest/no-standalone-expect": "warn",
            "jest/no-jasmine-globals": "warn"
        }
    },
    {
        name: "react hooks",
        extends: [reactHooksPlugin.configs["recommended-latest"]],
        files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
        rules: {
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn"
        }
    },
    {
        name: "typescript",
        extends: [tseslint.configs.recommended],
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname
            }
        },
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    varsIgnorePattern: "^_|createElement",
                    argsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                    args: "none"
                }
            ],

            "@typescript-eslint/no-restricted-types": [
                "error",
                {
                    types: {
                        "JSX.Element": {
                            message: "Use 'ReactElement' or 'ReactElement | null' instead",
                            fixWith: "ReactElement"
                        }
                    }
                }
            ],

            "@typescript-eslint/no-empty-object-type": "warn",
            "@typescript-eslint/no-unsafe-function-type": "warn",
            "@typescript-eslint/no-wrapper-object-types": "warn",

            "@typescript-eslint/ban-ts-comment": "warn",
            "@typescript-eslint/camelcase": "off",
            "@typescript-eslint/class-name-casing": "off",
            "@typescript-eslint/indent": "off",
            "@typescript-eslint/no-object-literal-type-assertion": "off",
            "@typescript-eslint/no-use-before-define": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-var-requires": "warn",
            "@typescript-eslint/explicit-function-return-type": [
                "warn",
                {
                    allowExpressions: true,
                    allowTypedFunctionExpressions: true
                }
            ],
            "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
            "@typescript-eslint/explicit-member-accessibility": [
                "error",
                {
                    accessibility: "no-public",
                    overrides: { parameterProperties: "explicit" }
                }
            ],
            "@typescript-eslint/member-ordering": [
                "error",
                {
                    default: ["static-field", "instance-field", "constructor", "instance-method", "static-method"]
                }
            ],
            "@typescript-eslint/no-empty-interface": ["error", { allowSingleExtends: true }],
            "@typescript-eslint/no-extraneous-class": "error",
            "@typescript-eslint/no-for-in-array": "error",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-parameter-properties": "off",
            "@typescript-eslint/no-this-alias": "error",
            "@typescript-eslint/no-useless-constructor": "error",
            "@typescript-eslint/prefer-for-of": "error",
            "@typescript-eslint/prefer-function-type": "error",
            "@typescript-eslint/unified-signatures": "error"
        }
    },
    {
        name: "widget-ts-js-undef",
        files: ["**/*.{,m,c}js"],
        // TODO: not sure if it is still needed
        rules: {
            "no-undef": "warn",
            "no-unused-vars": "warn"
        }
    },
    {
        name: "ease some rules for previews",
        files: ["prettier.config.js", "**/*.webmodeler.*", "**/*.editorPreview.*"],
        rules: {
            "@typescript-eslint/no-require-imports": "off",
            "@typescript-eslint/class-name-casing": "off"
        }
    },
    {
        name: "package.json checks",
        extends: [packageJson.configs.recommended],
        files: ["package.json"],
        rules: {
            "package-json/no-empty-fields": "off",
            "package-json/order-properties": [
                "error",
                {
                    order: packageJsonFieldsOrder
                }
            ]
        }
    },
    eslintPluginPrettierRecommended
);

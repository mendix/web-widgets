const packageJsonFieldsOrder = require("./package-json-fields-order");

module.exports = {
    trailingComma: "none",
    useTabs: false,
    tabWidth: 4,
    semi: true,
    singleQuote: false,
    printWidth: 120,
    bracketSpacing: true,
    bracketSameLine: false,
    arrowParens: "avoid",
    proseWrap: "always",
    plugins: ["@prettier/plugin-xml", "prettier-plugin-packagejson"],
    overrides: [
        {
            files: ["CHANGELOG.md"],
            options: {
                proseWrap: "preserve"
            }
        },
        {
            files: "package-lock.json",
            options: {
                tabWidth: 4,
                useTabs: false
            }
        },
        {
            files: "*.md",
            options: {
                proseWrap: "preserve"
            }
        },
        {
            files: "*.xml",
            options: {
                printWidth: 500,
                xmlSelfClosingSpace: true,
                xmlWhitespaceSensitivity: "preserve"
            }
        },
        {
            files: ["*.yaml", "*.yml"],
            options: {
                tabWidth: 4,
                // Disable line wrapping in .yml files
                printWidth: 99999
            }
        },
        {
            files: "package.json",
            options: {
                packageSortOrder: packageJsonFieldsOrder
            }
        }
    ]
};

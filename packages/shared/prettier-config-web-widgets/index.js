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
    xmlSelfClosingSpace: true,
    xmlWhitespaceSensitivity: "ignore",
    plugins: ["@prettier/plugin-xml"],
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
                printWidth: 500
            }
        },
        {
            files: ["*.yaml", "*.yml"],
            options: {
                tabWidth: 4,
                // Disable line wrapping in .yml files
                printWidth: 99999
            }
        }
    ]
};

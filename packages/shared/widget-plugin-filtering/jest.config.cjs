module.exports = {
    modulePathIgnorePatterns: ["<rootDir>/dist/"],
    transform: {
        "^.+\\.(t|j)sx?$": [
            "@swc/jest",
            {
                jsc: {
                    transform: {
                        react: {
                            runtime: "automatic"
                        }
                    }
                }
            }
        ]
    },
    moduleDirectories: ["node_modules", "src"],
    moduleNameMapper: {
        "big.js": "big.js",
        "\\.css$": "<rootDir>/__mocks__/styleMock.js",
        "(.+)\\.js": "$1"
    },
    // `nanoevents` is ESM only, so it has to be transformed.
    transformIgnorePatterns: ["/node_modules/(?!(\\.pnpm/nanoevents|nanoevents))"],
    extensionsToTreatAsEsm: [".ts"],
    testEnvironment: "jsdom",
    collectCoverage: !process.env.CI,
    coverageProvider: "v8"
};

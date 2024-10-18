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
        "(.+)\\.js": "$1"
    },
    extensionsToTreatAsEsm: [".ts"],
    testEnvironment: "jsdom",
    collectCoverage: !process.env.CI,
    coverageProvider: "v8"
};

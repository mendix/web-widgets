module.exports = {
    verbose: true,
    testEnvironment: "jsdom",
    modulePathIgnorePatterns: ["<rootDir>/dist/", "<rootDir>/mocks/"],
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
    moduleNameMapper: {
        "big.js": "big.js",
        "(.+)\\.js": "$1"
    },
    extensionsToTreatAsEsm: [".ts"],
    collectCoverage: !process.env.CI,
    coverageProvider: "v8"
};
